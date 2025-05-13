import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'wouter';
import HomeLayout from "@/components/layout/HomeLayout";
import { ArrowRight, Layers, BookOpen, GraduationCap, Lock, ShieldCheck, AlertTriangle, Sparkles, ChevronDown, Clock, Book, Zap, GamepadIcon, RocketIcon, Brain, Target, BarChart2, Cpu, LineChart, PenTool, Check, Quote as QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import Typewriter from "../components/Typewriter";
import mcLogoPath from "@assets/mc2i.png";
import fyneAvatarPath from "@assets/image_1745520990954.png";
import fyneCityBackgroundPath from "../assets/fyne_city_background.png";
import fyneSpaceViewPath from "../assets/fyne_space_view.png";
import fyneRobotPath from "../assets/fyne_robot.png";
import PageTitle from "@/components/utils/PageTitle";
import ThemeSwitch from "@/components/ThemeSwitch";

// Carte de module avec animation futuriste spatiale
const ModuleCard = ({ 
  title, 
  description, 
  icon, 
  color, 
  bgColor, 
  accentColor, 
  linkTo,
  classicMode = false,
  onCustomClick = null
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  accentColor: string;
  linkTo: string;
  classicMode?: boolean;
  onCustomClick?: ((e: React.MouseEvent) => void) | null;
}) => {
  const [isHover, setIsHover] = useState(false);
  
  // Détermine si on utilise le thème futuriste ou classique
  // Soit via la prop classicMode, soit via le contexte
  const { themeMode } = useTheme();
  const isClassic = classicMode || themeMode === 'classic';
  
  // Déterminer si c'est le module I AM CYBER
  const isCyberModule = title === "I AM CYBER";
  
  // Handler pour la navigation
  const handleClick = (e: React.MouseEvent) => {
    if (isCyberModule && onCustomClick) {
      e.preventDefault();
      onCustomClick(e);
    }
  };
  
  return (
    <div
      className="relative overflow-hidden h-full flex flex-col flex-1"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={isCyberModule && onCustomClick ? handleClick : undefined}
    >
      {/* Fond galactique et nébuleuse - uniquement en mode futuriste */}
      {!isClassic && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {/* Nébuleuses en arrière-plan */}
          <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-screen">
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-purple-500/10 rounded-full filter blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-cyan-500/10 rounded-full filter blur-2xl"></div>
          </div>
          
          {/* Petites étoiles scintillantes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.max(1, Math.random() * 2)}px`,
                height: `${Math.max(1, Math.random() * 2)}px`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `twinkle ${1.5 + Math.random() * 2}s infinite ease-in-out ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Ligne lumineuse supérieure - uniquement en mode futuriste */}
      {!isClassic && (
        <div className="absolute inset-x-0 -top-2 h-1 bg-gradient-to-r from-purple-400/70 via-cyan-400/70 to-blue-500/70 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-md"></div>
      )}
      
      <div className="p-6 flex flex-col h-full z-10 relative flex-1">
        {/* Icône avec style adapté au thème */}
        <div className="w-16 h-16 relative mb-6">
          {!isClassic && (
            <>
              {/* Halo lumineux derrière l'icône - uniquement en mode futuriste */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 opacity-40 transform group-hover:scale-[1.2] transition-all duration-500 group-hover:opacity-70 blur-sm"></div>
              
              {/* Points décoratifs d'arrière-plan - uniquement en mode futuriste */}
              <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-70 transition-opacity duration-500 delay-100 shadow-lg shadow-cyan-500/30"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 opacity-0 group-hover:opacity-70 transition-opacity duration-500 delay-150 shadow-lg shadow-purple-500/30"></div>
            </>
          )}
          
          {/* Icône au centre avec style adapté au thème */}
          <div className={`relative w-14 h-14 rounded-lg flex items-center justify-center 
            ${isClassic 
              ? 'bg-blue-100 shadow-sm border border-blue-200' 
              : 'bg-gradient-to-br from-blue-900/90 to-indigo-900/90 shadow-lg group-hover:shadow-cyan-400/30 backdrop-blur-sm border border-purple-500/40'
            } transition-all duration-300`}>
            
            {!isClassic && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-600/10 
                opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
            )}
            
            <div className={`${isClassic ? 'text-blue-600' : 'text-cyan-300 group-hover:text-cyan-200'} transition-colors duration-300 relative z-10`}>
              {icon}
            </div>
          </div>
        </div>
        
        {/* Titre avec style adapté au thème */}
        <h3 className={`text-xl font-bold mb-3 ${
          isClassic 
            ? 'text-gray-800 font-medium' 
            : 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 font-cyber-title tracking-wide group-hover:from-cyan-200 group-hover:to-purple-200'
          } transition-all duration-300`}>
          {title}
        </h3>
        
        {/* Description avec style adapté au thème */}
        <p className={`mb-6 flex-grow text-sm overflow-hidden ${
          isClassic 
            ? 'text-gray-600 line-clamp-3' 
            : 'text-blue-100/80 font-cyber-body line-clamp-3'
          }`}>
          {description}
        </p>
        
        {/* Bouton avec style adapté au thème */}
        <div className="mt-auto">
          <Link href={linkTo}>
            <Button 
              className={`${isClassic 
                ? 'bg-blue-600 hover:bg-blue-700 border-none' 
                : 'bg-gradient-to-r from-blue-800/90 via-purple-800/80 to-cyan-800/90 hover:from-cyan-700/90 hover:via-purple-700/80 hover:to-blue-700/90 shadow-md hover:shadow-cyan-500/30 border border-purple-500/30 overflow-hidden'
              } group transition-all duration-300 text-white relative`}
            >
              <span className="relative z-10 flex items-center">
                Explorer le module
                <ArrowRight className={`ml-2 transition-all duration-500 ${isHover ? 'translate-x-1' : ''}`} />
              </span>
              
              {/* Effet animé sur hover - uniquement en mode futuriste */}
              {!isClassic && (
                <>
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600/40 via-blue-600/40 to-transparent group-hover:w-full transition-all duration-700 ease-out"></span>
                  {/* Particules lumineuses */}
                  {isHover && Array.from({length: 3}).map((_, i) => (
                    <span key={i} className="absolute w-1 h-1 rounded-full bg-cyan-300 animate-ping" 
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDuration: `${0.8 + Math.random() * 1}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    ></span>
                  ))}
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Fonctionnalité Card avec style adaptatif (futuriste ou classique)
// Carte pour les scénarios AMOA
const ScenarioCard = ({ 
  scenario,
  index 
}: { 
  scenario: any;
  index: number;
}) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [isHover, setIsHover] = useState(false);
  
  // Extraire les détails du scénario
  const { title, description, difficulty, team = [] } = scenario;
  
  // Trouver le membre coupable
  const guiltyMember = team.find((member: any) => member.isGuilty);
  
  return (
    <motion.div
      className={`${isFuturistic 
        ? 'bg-gradient-to-b from-emerald-950/90 to-blue-950/90 backdrop-blur-sm border border-emerald-500/30 text-white' 
        : 'bg-white border border-gray-200 text-gray-800'} 
        rounded-xl p-5 shadow-md h-full relative overflow-hidden`}
      whileHover={{ y: -5, boxShadow: isFuturistic ? '0 12px 30px rgba(16, 185, 129, 0.15)' : '0 12px 30px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {/* Fond galactique - uniquement en mode futuriste */}
      {isFuturistic && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {/* Nébuleuses et lueurs */}
          <div className="absolute top-0 right-0 w-full h-full mix-blend-screen">
            <div className="absolute top-10 right-10 w-40 h-40 bg-emerald-500/10 rounded-full filter blur-xl opacity-40"></div>
            <div className="absolute bottom-5 left-5 w-32 h-32 bg-blue-500/10 rounded-full filter blur-xl opacity-30"></div>
          </div>
          
          {/* Petites étoiles scintillantes */}
          {Array.from({ length: 6 }).map((_, i) => (
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
      
      {/* Badge de difficulté */}
      <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
        difficulty === 'facile' 
          ? isFuturistic ? 'bg-green-800/80 text-green-200' : 'bg-green-100 text-green-800'
          : difficulty === 'moyen'
            ? isFuturistic ? 'bg-yellow-800/80 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
            : isFuturistic ? 'bg-red-800/80 text-red-200' : 'bg-red-100 text-red-800'
      } font-medium`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </div>
      
      {/* Titre avec style adaptatif */}
      <h3 className={`text-lg font-semibold mb-2 mt-1 pr-20 ${
        isFuturistic 
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-blue-300' 
          : 'text-gray-800'
        } font-cyber-title`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`${isFuturistic ? 'text-blue-100/80' : 'text-gray-600'} text-sm font-cyber-body mb-3 line-clamp-2`}>
        {description}
      </p>
      
      {/* Information sur l'équipe */}
      <div className="mt-3 mb-2">
        <div className={`text-xs uppercase tracking-wide font-semibold mb-2 ${isFuturistic ? 'text-emerald-400' : 'text-emerald-600'}`}>
          Équipe: {team.length} membres
        </div>
        
        {guiltyMember && (
          <div className={`text-xs ${isFuturistic ? 'text-purple-300/80' : 'text-purple-600'} font-medium line-clamp-1`}>
            <span className="opacity-70">Responsable caché:</span> {guiltyMember.role}
          </div>
        )}
      </div>
      
      {/* Bouton pour jouer */}
      <div className="mt-auto pt-3">
        <Link href="/amoa/projet-imposteur">
          <Button 
            className={`${isFuturistic 
              ? 'bg-gradient-to-r from-emerald-800/90 via-blue-800/80 to-emerald-800/90 hover:from-emerald-700/90 hover:via-blue-700/80 hover:to-emerald-700/90 shadow-md hover:shadow-emerald-500/30 border border-emerald-500/30 text-white overflow-hidden' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'
            } text-xs h-8 px-3 w-full group transition-all duration-300 relative`}
          >
            <span className="relative z-10 flex items-center justify-center">
              Lancer l'enquête
              <ArrowRight className={`w-4 h-4 ml-1.5 transition-all duration-500 ${isHover ? 'translate-x-1' : ''}`} />
            </span>
            
            {/* Effet animé sur hover - uniquement en mode futuriste */}
            {isFuturistic && (
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-600/40 via-emerald-600/40 to-transparent group-hover:w-full transition-all duration-700 ease-out"></span>
            )}
          </Button>
        </Link>
      </div>
      
      {/* Ligne décorative en bas - uniquement en mode futuriste */}
      {isFuturistic && (
        <div className="absolute bottom-0 left-0 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      )}
    </motion.div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [isHover, setIsHover] = useState(false);

  return (
    <motion.div
      className={`${isFuturistic 
        ? 'bg-gradient-to-b from-blue-950/90 to-purple-950/90 backdrop-blur-sm border border-purple-500/30 text-white' 
        : 'bg-white border border-gray-200 text-gray-800'} 
        rounded-xl p-6 shadow-md h-full relative overflow-hidden`}
      whileHover={{ y: -5, boxShadow: isFuturistic ? '0 12px 30px rgba(124, 58, 237, 0.15)' : '0 12px 30px rgba(0, 0, 0, 0.1)' }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Fond galactique - uniquement en mode futuriste */}
      {isFuturistic && (
        <div className="absolute inset-0 overflow-hidden opacity-40">
          {/* Nébuleuses et lueurs */}
          <div className="absolute top-0 right-0 w-full h-full mix-blend-screen">
            <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full filter blur-xl opacity-40"></div>
            <div className="absolute bottom-5 left-5 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-xl opacity-30"></div>
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
      
      {/* Icône avec style adaptatif */}
      <div className={`p-3.5 ${isFuturistic 
        ? 'bg-gradient-to-br from-blue-900/80 to-purple-900/80 text-cyan-300 border border-purple-500/40 shadow-md' 
        : 'bg-blue-100 text-blue-600 border border-gray-200'} 
        rounded-xl w-fit mb-4 relative overflow-hidden group`}>
        {isFuturistic && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-blue-500/20 
              opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Halo lumineux sur hover */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 
              filter blur-md opacity-0 transition-opacity duration-500 ${isHover ? 'opacity-70' : ''}`}></div>
            
            {/* Particule lumineuse animée */}
            {isHover && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 
                bg-cyan-300 rounded-full animate-ping opacity-70" style={{ animationDuration: '1.5s' }}></div>
            )}
          </>
        )}
        <div className="relative z-10">{icon}</div>
      </div>
      
      <h3 className={`text-lg font-semibold mb-2 ${
        isFuturistic 
          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300' 
          : 'text-gray-800'
        } font-cyber-title`}>
        {title}
      </h3>
      <p className={`${isFuturistic ? 'text-blue-100/80' : 'text-gray-600'} text-sm font-cyber-body`}>
        {description}
      </p>
      
      {/* Ligne décorative en bas - uniquement en mode futuriste */}
      {isFuturistic && (
        <div className="absolute bottom-0 left-0 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      )}
    </motion.div>
  );
};

export default function Home() {
  const { userName } = useChatContext();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [, setLocation] = useLocation();
  
  // État pour stocker les scénarios chargés
  // Les états et fonctions liés aux scénarios ont été supprimés de la page d'accueil
  // Ils sont maintenant uniquement dans la section "GAMIFICATION AVANCÉE" de "I AM mc2i"
  
  // L'effet de chargement des scénarios a été supprimé
  // Ce code est maintenant uniquement dans la section "GAMIFICATION AVANCÉE" de "I AM mc2i"
  
  // État pour stocker les modules personnalisés chargés depuis l'API
  const [customModules, setCustomModules] = useState<any[]>([]);
  
  // États pour la modalité de protection par mot de passe pour tous les modules
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  // Fonction pour vérifier le mot de passe pour accéder aux modules
  const handlePasswordCheck = () => {
    const correctPassword = "Hey!Bienvenuechezmc2i,enfin,sur,fyne:)2025@";
    
    if (password === correctPassword) {
      // Mot de passe correct, rediriger vers le module sélectionné
      setIsPasswordModalOpen(false);
      setPassword('');
      setPasswordError('');
      setPasswordAttempts(0);
      
      // Redirection vers le module correspondant
      if (selectedModule) {
        window.location.href = selectedModule;
      }
    } else {
      // Mot de passe incorrect
      setPasswordError('Mot de passe incorrect. Veuillez réessayer.');
      setPasswordAttempts(prev => prev + 1);
      // Après 3 tentatives, envoyer une alerte au support
      if (passwordAttempts >= 2) {
        setPasswordError('Attention: Une tentative d\'accès non autorisé a été détectée. Une alerte sera transmise par mail au support technique.');
      }
    }
  };
  
  // Fonction pour ouvrir la modale de mot de passe avec le module sélectionné
  const openPasswordModal = (e: React.MouseEvent, moduleRoute: string) => {
    e.preventDefault();
    setSelectedModule(moduleRoute);
    setIsPasswordModalOpen(true);
  };
  
  // Charger les modules personnalisés au chargement de la page
  useEffect(() => {
    const fetchCustomModules = async () => {
      try {
        const response = await fetch('/api/module-generator/modules');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.modules)) {
            setCustomModules(data.modules);
          }
        } else {
          console.error('Erreur lors du chargement des modules personnalisés:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules personnalisés:', error);
      }
    };
    
    fetchCustomModules();
  }, []);
  
  // Modules avec animations interactives
  const modules = [
      // Le module Outils IA a été supprimé à la demande du client
      // Le module CyberForge Academy a été supprimé pour reconstruction
    {
      title: "I AM CYBER",
      description: "Immergez-vous dans des simulations de cybersécurité interactives et choisissez entre le mode agent IA conversationnel ou les scénarios tactiques de défense.",
      icon: null,
      color: "bg-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      accentColor: "bg-blue-500",
      linkTo: "/cyber" // Lien direct vers la page cyber
    },
    // Le module Cyber Playground a été supprimé selon la demande
    {
      title: "I AM DATA & IA",
      description: "Maîtrisez les concepts avancés de data science et d'intelligence artificielle à travers des simulations pratiques et des défis concrets.",
      icon: null,
      color: "bg-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      accentColor: "bg-purple-500",
      linkTo: "/data-ia"
    },
    {
      title: "IAM mc2i",
      description: "Perfectionnez vos compétences en assistance à maîtrise d'ouvrage avec des experts virtuels qui vous guideront à travers des cas complexes.",
      icon: null,
      color: "bg-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      accentColor: "bg-emerald-500",
      linkTo: "/amoa"
    },
    {
      title: "Soyez qui vous voulez",
      description: "Créez votre propre parcours d'apprentissage personnalisé avec notre IA générative qui s'adapte à vos besoins spécifiques et objectifs professionnels.",
      icon: null,
      color: "bg-rose-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-rose-100",
      accentColor: "bg-rose-500",
      linkTo: "/playground/module-generator"
    }
  ];
  
  // Fonctionnalités
  const features = [
    {
      icon: null,
      title: "Personnages IA avancés",
      description: "Interagissez avec des PNJ ultra-réalistes qui s'adaptent à votre style d'apprentissage"
    },
    {
      icon: null,
      title: "Apprentissage adaptatif",
      description: "Algorithmes d'IA qui ajustent la difficulté et le contenu selon votre progression"
    },
    {
      icon: null,
      title: "Scénarios contextuels",
      description: "Simulation de situations professionnelles réelles pour un apprentissage applicable"
    },
    {
      icon: null,
      title: "Feedback instantané",
      description: "Évaluation continue et suggestions d'amélioration par l'intelligence artificielle"
    },
    {
      icon: null,
      title: "Modules sectoriels",
      description: "Contenus spécialisés adaptés aux enjeux spécifiques de votre industrie"
    },
    {
      icon: null,
      title: "Accessibilité totale",
      description: "Disponible sur tous vos appareils avec synchronisation automatique"
    }
  ];
  
  return (
    <HomeLayout>
      <PageTitle title="Accueil" />
      
      {/* Hero Section avec image de fond futuriste ou classique */}
      <div className="relative overflow-hidden h-screen w-screen">
        {/* Image de fond différente selon le thème */}
        <div className="absolute inset-0 z-0">
          {isFuturistic ? (
            // Image de fond futuriste (spatiale)
            <>
              <img 
                src={fyneSpaceViewPath} 
                alt="Vue spatiale FYNE" 
                className="w-full h-full object-cover brightness-95"
                style={{ objectPosition: "center" }}
              />
              {/* Overlay pour améliorer la lisibilité du texte - Opacité réduite */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-blue-950/10 to-transparent"></div>
            </>
          ) : (
            // Design épuré pour le mode classique - fond blanc uni avec robot
            <div className="bg-white w-full h-full relative">
              {/* Robot FYNE en bas à droite - plus visible et position ajustée */}
              <img 
                src={fyneRobotPath} 
                alt="Robot FYNE" 
                className="absolute bottom-0 right-0 h-[95vh] object-contain z-10"
                style={{ objectPosition: "bottom right" }}
              />
              {/* Overlay très léger - seulement du côté gauche pour le contraste du texte */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-0"></div>
            </div>
          )}
        </div>
        
        {/* Effet de particules numériques - uniquement en mode futuriste */}
        {isFuturistic && (
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
        )}
        
        {/* Lignes numériques animées - uniquement en mode futuriste */}
        {isFuturistic && (
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
        )}

        {/* Section principale réinventée pour une expérience plus immersive */}
        <div className="w-full relative z-10 overflow-hidden">
          {/* Arrière-plan abstrait animé - apparaît progressivement */}
          <motion.div 
            className="absolute inset-0 -z-10 opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFuturistic ? 0.25 : 0.1 }}
            transition={{ duration: 1.5 }}
          >
            {!isFuturistic && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 20% 40%, rgba(37, 99, 235, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.1) 0%, transparent 40%)'
                }}></div>
              </div>
            )}
            {isFuturistic && (
              <div className="absolute inset-0">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute rounded-full bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: Math.random() * 0.7 + 0.3 }}
                    transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, repeatType: "reverse" }}
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      width: `${Math.max(1, Math.random() * 3)}px`,
                      height: `${Math.max(1, Math.random() * 3)}px`,
                      boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Design de grille futuriste - lignes subtiles */}
          <motion.div 
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2 }}
          >
            <div className="h-full w-full" style={{
              backgroundImage: isFuturistic 
                ? 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)'
                : 'linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)',
              backgroundSize: '80px 80px'
            }}>
            </div>
          </motion.div>

          {/* Structure principale avec une disposition en deux colonnes équilibrées */}
          <div className="max-w-screen-2xl mx-auto px-4 py-12 md:py-24 lg:py-32">
            {/* En-tête centré pour attirer l'attention */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
              {/* Badge innovant */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                {isFuturistic ? (
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/40 text-blue-200 text-sm font-medium backdrop-blur-md shadow-lg">
                    <Sparkles className="h-4 w-4 mr-2 text-cyan-300" />
                    <span>Propulsé par l'Intelligence Artificielle</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 text-sm font-medium shadow-sm">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Formation Assistée par IA</span>
                  </div>
                )}
              </motion.div>
              
              {/* Slogan FYNE animé avec un design élégant */}
              <motion.div
                className="mb-4 sm:mb-6 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className={`text-4xl font-bold ${isFuturistic ? 'font-cyber-title text-white' : 'text-gray-800'} tracking-tight`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  {isFuturistic ? (
                    <div className="inline-flex justify-center tracking-tight">
                      <motion.span 
                        className="text-cyan-300"
                        animate={{ 
                          textShadow: ["0 0 5px rgba(34,211,238,0)", "0 0 15px rgba(34,211,238,0.5)", "0 0 5px rgba(34,211,238,0)"]
                        }} 
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "loop" }}
                      >F</motion.span>
                      <span className="mr-1">or</span>
                      <motion.span 
                        className="text-cyan-300"
                        animate={{ 
                          textShadow: ["0 0 5px rgba(34,211,238,0)", "0 0 15px rgba(34,211,238,0.5)", "0 0 5px rgba(34,211,238,0)"]
                        }} 
                        transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
                      >Y</motion.span>
                      <span className="mr-1">our</span>
                      <motion.span 
                        className="text-cyan-300"
                        animate={{ 
                          textShadow: ["0 0 5px rgba(34,211,238,0)", "0 0 15px rgba(34,211,238,0.5)", "0 0 5px rgba(34,211,238,0)"]
                        }} 
                        transition={{ duration: 2.5, delay: 1, repeat: Infinity, repeatType: "loop" }}
                      >N</motion.span>
                      <span className="mr-1">ext</span>
                      <motion.span 
                        className="text-cyan-300"
                        animate={{ 
                          textShadow: ["0 0 5px rgba(34,211,238,0)", "0 0 15px rgba(34,211,238,0.5)", "0 0 5px rgba(34,211,238,0)"]
                        }} 
                        transition={{ duration: 2.5, delay: 1.5, repeat: Infinity, repeatType: "loop" }}
                      >E</motion.span>
                      <span>xperience</span>
                    </div>
                  ) : (
                    <div className="inline-flex justify-center tracking-tight">
                      <motion.span 
                        className="text-blue-600"
                        animate={{ 
                          color: ["#2563eb", "#1d4ed8", "#2563eb"]
                        }} 
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      >F</motion.span>
                      <span className="mr-1">or</span>
                      <motion.span 
                        className="text-blue-600"
                        animate={{ 
                          color: ["#2563eb", "#1d4ed8", "#2563eb"]
                        }} 
                        transition={{ duration: 3, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      >Y</motion.span>
                      <span className="mr-1">our</span>
                      <motion.span 
                        className="text-blue-600"
                        animate={{ 
                          color: ["#2563eb", "#1d4ed8", "#2563eb"]
                        }} 
                        transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: "reverse" }}
                      >N</motion.span>
                      <span className="mr-1">ext</span>
                      <motion.span 
                        className="text-blue-600"
                        animate={{ 
                          color: ["#2563eb", "#1d4ed8", "#2563eb"]
                        }} 
                        transition={{ duration: 3, delay: 1.5, repeat: Infinity, repeatType: "reverse" }}
                      >E</motion.span>
                      <span>xperience</span>
                    </div>
                  )}
                </motion.div>
                
                {/* Ligne décorative animée */}
                <motion.div 
                  className="mx-auto w-48 h-[3px] mt-3 overflow-hidden rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "12rem" }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.div 
                    className={`w-full h-full ${isFuturistic 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500' 
                      : 'bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400'}`}
                    animate={{ 
                      x: ["-100%", "100%"]
                    }} 
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Titre principal avec animation et design moderne */}
              <motion.h1 
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 ${
                  isFuturistic 
                    ? 'text-white font-cyber-title tracking-wide' 
                    : 'text-gray-800 tracking-tight'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <div className="flex flex-col sm:block text-center">
                  <span className="inline-block mb-4 sm:mb-0">Améliorez </span>
                  <span className="inline-block my-4 sm:my-0 relative mx-3">
                    <span className={isFuturistic 
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 relative z-10"
                      : "text-blue-600 relative z-10"
                    }>votre expertise</span>
                    {isFuturistic && (
                      <motion.div 
                        className="absolute inset-0 blur-sm"
                        animate={{ 
                          opacity: [0.3, 0.5, 0.3]
                        }} 
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                    )}
                  </span>
                  <span className="inline-block mt-4 sm:mt-0">avec FYNE</span>
                </div>
              </motion.h1>
              
              {/* Description engageante */}
              <motion.p 
                className={`text-lg sm:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed ${
                  isFuturistic 
                    ? 'text-blue-100 font-cyber-body' 
                    : 'text-gray-600'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                Découvrez une nouvelle dimension d'apprentissage interactif avec nos modules IA innovants qui s'adaptent parfaitement à votre progression.
              </motion.p>
              
              {/* Bouton d'action centré avec animation et effet avancé */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <Link href="/cyber">
                  <Button 
                    size="lg" 
                    className={`relative px-10 py-6 shadow-lg group font-medium text-lg overflow-hidden transition-all duration-300 ${
                      isFuturistic 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border border-blue-400/20 hover:shadow-blue-500/30 hover:shadow-xl' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {isFuturistic && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/0 to-indigo-400/20"
                        animate={{ 
                          x: ["-100%", "100%"]
                        }} 
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          repeatType: "loop", 
                          ease: "linear"
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      Démarrer une expérience
                      <motion.div 
                        animate={{ x: [0, 5, 0] }} 
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                        className="ml-2"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </span>
                  </Button>
                </Link>
              </motion.div>
              
              {/* Section d'arguments supprimée à la demande de l'utilisateur */}
            </div>
            
            {/* Section de statistiques supprimée à la demande de l'utilisateur */}
            
            {/* Séparateur élégant */}
            <div className="mt-24 mb-12">
              <div className={`h-px max-w-sm mx-auto ${
                isFuturistic ? 'bg-gradient-to-r from-transparent via-blue-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-200 to-transparent'
              }`}></div>
            </div>
            
            {/* Icône de défilement pour indiquer de continuer */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ 
                opacity: { duration: 0.5, delay: 1 },
                y: { duration: 2, repeat: Infinity, repeatType: "loop" }
              }}
            >
              <div className={`rounded-full p-2 ${
                isFuturistic 
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-700/30' 
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}>
                <ChevronDown className="h-6 w-6" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Section Modules d'Excellence - Mise en avant */}
      <div className={`relative ${isFuturistic ? 'bg-gradient-to-b from-gray-900 to-blue-950' : 'bg-gradient-to-b from-gray-100 to-slate-200'} py-16 lg:py-24 overflow-hidden`}>
        {/* Éléments décoratifs - uniquement en mode futuriste */}
        {isFuturistic && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-10 left-10 w-64 h-64 bg-blue-800/30 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-900/30 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-900/30 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            
            {/* Étoiles en arrière-plan */}
            <div className="absolute inset-0">
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.max(1, Math.random() * 3)}px`,
                    height: `${Math.max(1, Math.random() * 3)}px`,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 0 3px rgba(255, 255, 255, 0.5)',
                    opacity: Math.random() * 0.8 + 0.2
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-4">
                {isFuturistic ? (
                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-900/60 text-cyan-300 font-cyber-accent tracking-wide border border-blue-500/30 backdrop-blur-sm">
                    Découvrez nos solutions
                  </span>
                ) : (
                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Découvrez nos solutions
                  </span>
                )}
              </div>
              
              {isFuturistic ? (
                // Titre en mode futuriste
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight font-cyber-title">
                  Nos modules <span className="text-cyan-400 relative">
                    d'excellence
                    <svg className="absolute bottom-0 left-0 w-full" height="5" viewBox="0 0 200 5" preserveAspectRatio="none">
                      <path d="M0 5 Q 40 0, 80 2 T 160 3 T 200 0 V 5 H 0 Z" fill="rgba(34, 211, 238, 0.4)" />
                    </svg>
                  </span>
                </h2>
              ) : (
                // Titre en mode classique
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                  Nos modules <span className="text-blue-600 relative">
                    d'excellence
                    <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-blue-500/50 rounded-full"></div>
                  </span>
                </h2>
              )}
              
              <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
                isFuturistic 
                  ? 'text-blue-100 font-cyber-body' 
                  : 'text-gray-600'
              }`}>
                Une expérience d'apprentissage nouvelle génération, adaptée à vos besoins
              </p>
            </motion.div>
          </div>
          
          {/* Grille de modules avec style adapté selon le thème */}
          <div className="relative z-10 my-12">
            {/* Fond décoratif avec motif - adapté selon le thème */}
            {isFuturistic ? (
              // Fond futuriste
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 rounded-3xl overflow-hidden -z-10 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                       backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 25%)',
                       backgroundSize: '120px 120px',
                       backgroundRepeat: 'repeat'
                     }}>
                </div>
                {/* Bordure lumineuse */}
                <div className="absolute inset-0 border border-cyan-500/30 rounded-3xl"></div>
                
                {/* Effet de particules spatiales */}
                <div className="absolute inset-0">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.max(1, Math.random() * 2)}px`,
                        height: `${Math.max(1, Math.random() * 2)}px`,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
                        opacity: Math.random() * 0.7 + 0.3
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Fond classique
              <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden -z-10 shadow-sm">
                <div className="absolute inset-0 border border-blue-100 rounded-3xl"></div>
              </div>
            )}
            
            {/* Grille principale */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
              {/* Modules prédéfinis */}
              {modules.map((module, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="transform hover:scale-105 hover:z-20 transition-all duration-300 group"
                >
                  {isFuturistic ? (
                    // Wrapper avec effets futuristes galactiques
                    <div className="relative bg-gradient-to-b from-blue-950/90 to-indigo-950/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden group-hover:shadow-cyan-500/60 border border-purple-500/40 h-72">
                      {/* Effet de nébuleuse et étoiles en arrière-plan */}
                      <div className="absolute inset-0 overflow-hidden">
                        {/* Nébuleuse en arrière-plan */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-screen">
                          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-cyan-500/10 rounded-full filter blur-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-purple-500/15 rounded-full filter blur-2xl"></div>
                          <div className="absolute top-1/3 left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-xl"></div>
                        </div>
                        
                        {/* Petites étoiles scintillantes */}
                        {Array.from({ length: 20 }).map((_, i) => (
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
                      
                      {/* Effet de lueur sur hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 transition-opacity duration-500"></div>
                      
                      {/* Le module */}
                      <ModuleCard 
                        {...module} 
                        onCustomClick={(e) => openPasswordModal(e, module.linkTo)}
                      />
                      
                      {/* Accent line galactique */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>
                    </div>
                  ) : (
                    // Wrapper avec style classique - design avec taille égale
                    <div className="relative bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-72">
                      {/* Header avec la couleur du module */}
                      <div className={`h-3 w-full ${module.color.replace('bg-', 'bg-')}`}></div>
                      
                      {/* Contenu du module - layout vertical pour avoir une taille uniforme */}
                      <div className="p-6 flex flex-col h-full">
                        {/* Icône en haut */}
                        <div className="flex items-center mb-4">
                          <div className={`w-14 h-14 ${module.bgColor} rounded-xl flex items-center justify-center shadow mr-4 flex-shrink-0`}>
                            <div className={`${module.color} p-2 rounded-md`}>
                              {module.icon}
                            </div>
                          </div>
                          
                          {/* Titre à côté de l'icône */}
                          <h3 className="text-lg font-semibold text-gray-800">
                            {module.title}
                          </h3>
                        </div>
                        
                        {/* Contenu textuel */}
                        <div className="flex-grow">
                          <p className="text-gray-600 text-sm mb-6 h-auto max-h-32 overflow-y-auto pr-2 custom-scrollbar module-description">
                            {module.description}
                          </p>
                        </div>
                        
                        {/* Bouton en bas */}
                        <div className="mt-auto">
                          <button 
                            onClick={(e) => openPasswordModal(e, module.linkTo)}
                            className={`${module.color} text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all hover:shadow-md`}
                          >
                            Explorer
                            <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Modules personnalisés */}
              {customModules.map((customModule, index) => (
                <motion.div
                  key={`custom-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (modules.length + index) * 0.1 }}
                  viewport={{ once: true }}
                  className="transform hover:scale-105 hover:z-20 transition-all duration-300 group"
                >
                  {isFuturistic ? (
                    // Wrapper avec effets futuristes galactiques
                    <div className="relative bg-gradient-to-b from-blue-950/90 to-indigo-950/90 backdrop-blur-md rounded-xl shadow-xl overflow-hidden group-hover:shadow-cyan-500/60 border border-purple-500/40 h-72">
                      {/* Effet de nébuleuse et étoiles en arrière-plan */}
                      <div className="absolute inset-0 overflow-hidden">
                        {/* Nébuleuse en arrière-plan */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-screen">
                          <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-cyan-500/10 rounded-full filter blur-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-purple-500/15 rounded-full filter blur-2xl"></div>
                          <div className="absolute top-1/3 left-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full filter blur-xl"></div>
                        </div>
                        
                        {/* Petites étoiles scintillantes */}
                        {Array.from({ length: 20 }).map((_, i) => (
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
                      
                      {/* Effet de lueur sur hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 transition-opacity duration-500"></div>
                      
                      {/* Le module personnalisé */}
                      <ModuleCard 
                        title={customModule.iamName || customModule.name}
                        description={customModule.description}
                        icon={<GraduationCap size={36} />}
                        color="bg-purple-600"
                        bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
                        accentColor="bg-purple-500"
                        linkTo={`/modules/${customModule.id}`}
                      />
                      
                      {/* Accent line galactique */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>
                    </div>
                  ) : (
                    // Wrapper avec style classique - design avec taille égale
                    <div className="relative bg-white rounded-xl shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-72">
                      {/* Header avec la couleur du module */}
                      <div className="h-3 w-full bg-purple-600"></div>
                      
                      {/* Contenu du module - layout vertical pour avoir une taille uniforme */}
                      <div className="p-6 flex flex-col h-full">
                        {/* Icône en haut */}
                        <div className="flex items-center mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow mr-4 flex-shrink-0">
                            <div className="bg-purple-600 p-2 rounded-md">
                              <GraduationCap size={24} className="text-white" />
                            </div>
                          </div>
                          
                          {/* Titre à côté de l'icône */}
                          <h3 className="text-lg font-semibold text-gray-800">
                            {customModule.iamName || customModule.name}
                          </h3>
                        </div>
                        
                        {/* Contenu textuel */}
                        <div className="flex-grow">
                          <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                            {customModule.description}
                          </p>
                        </div>
                        
                        {/* Bouton en bas */}
                        <div className="mt-auto">
                          <button 
                            onClick={(e) => openPasswordModal(e, `/custom-module/${customModule.id}`)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all hover:shadow-md"
                          >
                            Explorer
                            <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Bouton "Explorer tous nos modules" supprimé */}
        </div>
      </div>

      {/* Section Technologies d'IA utilisées */}
      <div className={`relative ${isFuturistic ? 'bg-gradient-to-b from-blue-950 to-gray-900' : 'bg-white'} py-16 lg:py-24 relative overflow-hidden`}>
        {/* Fond étoilé subtil - uniquement en mode futuriste */}
        {isFuturistic && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Nébuleuses en arrière-plan */}
            <div className="absolute top-0 right-0 w-full h-full opacity-20 mix-blend-screen">
              <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-emerald-500/10 rounded-full filter blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-blue-500/10 rounded-full filter blur-[100px]"></div>
            </div>
            
            {/* Petites étoiles scintillantes */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.max(1, Math.random() * 2)}px`,
                  height: `${Math.max(1, Math.random() * 2)}px`,
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `twinkle ${1.5 + Math.random() * 2}s infinite ease-in-out ${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Titre de la section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-4">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${isFuturistic ? 'bg-blue-900/60 text-cyan-300 border-blue-500/30' : 'bg-blue-600/80 text-white border-blue-400/50'} font-cyber-accent tracking-wide border backdrop-blur-sm`}>
                  Propulsé par l'IA
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-bold ${isFuturistic ? 'text-white' : 'text-blue-900'} mb-4 font-cyber-title tracking-wide`}>
                Technologies <span className={`${isFuturistic ? 'text-cyan-400' : 'text-blue-600'} relative`}>
                  avancées
                  <svg className="absolute bottom-0 left-0 w-full" height="5" viewBox="0 0 200 5" preserveAspectRatio="none">
                    <path d="M0 5 Q 40 0, 80 2 T 160 3 T 200 0 V 5 H 0 Z" fill={isFuturistic ? "rgba(34, 211, 238, 0.4)" : "rgba(37, 99, 235, 0.4)"} />
                  </svg>
                </span>
              </h2>
              <p className={`text-xl ${isFuturistic ? 'text-blue-100/90' : 'text-slate-700'} max-w-3xl mx-auto font-cyber-body`}>
                Découvrez les modèles d'intelligence artificielle qui alimentent notre plateforme
              </p>
            </motion.div>
          </div>
          
          {/* Cartes de technologie */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto max-w-4xl lg:max-w-5xl">
            {[
              {
                title: "Modèle d'intélligence artificiel",
                description: "Notre modèle principal de génération de contenu, capable de comprendre et créer du texte avancé avec une compréhension nuancée du contexte professionnel.",
                icon: <Cpu className="h-8 w-8" />,
                features: ["Compréhension contextuelle", "Personnalisation avancée", "Support multilingue"]
              },
              {
                title: "Analyse comportementale",
                description: "Algorithmes qui évaluent vos interactions pour adapter automatiquement la difficulté et le contenu en fonction de votre progression et vos points forts.",
                icon: <LineChart className="h-8 w-8" />,
                features: ["Adaptation intelligente", "Analyse personnalisée", "Progression optimisée"]
              },
              {
                title: "Génération de scénarios",
                description: "Moteur créatif qui produit des cas d'usage, simulations et questionnaires uniques pour chaque session d'apprentissage.",
                icon: <PenTool className="h-8 w-8" />,
                features: ["Cas pratiques réalistes", "Variété infinie", "Pertinence sectorielle"]
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`rounded-2xl overflow-hidden ${
                  isFuturistic 
                    ? 'bg-blue-900/20 border border-blue-500/30 backdrop-blur-sm' 
                    : 'bg-white border border-gray-100 shadow-lg'
                } hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="p-8 group">
                  <div className={`mb-6 inline-flex rounded-full p-5 ${
                    isFuturistic
                      ? 'bg-gradient-to-br from-blue-800/60 to-blue-900/80 text-cyan-300 shadow-inner shadow-blue-500/20'
                      : 'bg-gradient-to-br from-blue-100 to-indigo-100/80 text-blue-700 shadow-inner shadow-blue-200/50'
                  }`}>
                    <div className="scale-125 transform transition-transform duration-300 group-hover:scale-150">
                      {tech.icon}
                    </div>
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isFuturistic 
                      ? 'text-cyan-300 font-cyber-accent bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700'
                  }`}>
                    {tech.title}
                  </h3>
                  
                  <p className={`mb-6 text-lg ${
                    isFuturistic ? 'text-blue-100/90' : 'text-gray-600'
                  }`}>
                    {tech.description}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    {tech.features.map((feature, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center ${
                          isFuturistic ? 'text-blue-200/70' : 'text-gray-700'
                        } transition-all duration-300 group-hover:translate-x-1`}
                      >
                        <span className={`flex items-center justify-center h-5 w-5 rounded-full mr-3 ${
                          isFuturistic 
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' 
                            : 'bg-blue-100 text-blue-600 border border-blue-200'
                        }`}>
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Effet décoratif en bas */}
                {isFuturistic ? (
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-70 relative">
                    <div className="absolute bottom-0 left-1/2 w-12 h-1.5 bg-white blur-sm opacity-60 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="h-1 w-2/3 mx-auto bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 rounded-full opacity-70"></div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Citation ou témoignage */}
          <motion.div 
            className={`mt-16 rounded-2xl p-10 ${
              isFuturistic 
                ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 backdrop-blur-sm shadow-lg' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-xl'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center text-center relative">
              {/* Éléments décoratifs */}
              <div className="absolute top-0 left-10 w-20 h-20 rounded-full bg-blue-500/5 backdrop-blur-xl"></div>
              <div className="absolute bottom-0 right-10 w-16 h-16 rounded-full bg-indigo-500/5 backdrop-blur-xl"></div>
              
              <div className={`relative p-3 rounded-full mb-8 ${
                isFuturistic
                  ? 'bg-blue-800/30 border border-blue-500/20'
                  : 'bg-blue-100/70 border border-blue-200'
              }`}>
                <QuoteIcon className={`h-12 w-12 ${
                  isFuturistic
                    ? 'text-cyan-300'
                    : 'text-blue-600'
                }`} />
              </div>
              
              <blockquote className="mb-8 relative">
                <p className={`text-2xl italic font-light leading-relaxed ${
                  isFuturistic
                    ? 'text-blue-100'
                    : 'text-gray-700'
                }`}>
                  "L'intelligence artificielle ne remplace pas l'intelligence humaine, elle l'augmente. Notre plateforme combine le meilleur des deux pour créer une expérience d'apprentissage inégalée."
                </p>
              </blockquote>
              
              <div className={`font-semibold ${
                isFuturistic
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700'
              }`}>
                Direction de l'Innovation
              </div>
              <div className={`text-sm ${isFuturistic ? 'text-blue-200/60' : 'text-gray-500'}`}>
                mc2i
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Section Caracteristiques */}
      <div className={`relative ${isFuturistic ? 'bg-gradient-to-b from-blue-950 to-gray-900' : 'bg-gradient-to-b from-blue-100 to-white'} py-16 lg:py-24 relative overflow-hidden`}>
        {/* Fond étoilé - uniquement en mode futuriste */}
        {isFuturistic && (
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 150 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.max(1, Math.random() * 2)}px`,
                  height: `${Math.max(1, Math.random() * 2)}px`,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
                  opacity: Math.random() * 0.7 + 0.3
                }}
              />
            ))}
            {/* Nébuleuse décorative */}
            <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-800/10 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-purple-800/10 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block mb-4">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${isFuturistic ? 'bg-blue-900/60 text-cyan-300 border-blue-500/30' : 'bg-blue-600/80 text-white border-blue-400/50'} font-cyber-accent tracking-wide border backdrop-blur-sm`}>
                  Technologies avancées
                </span>
              </div>
              <h2 className={`text-3xl sm:text-4xl font-bold ${isFuturistic ? 'text-white' : 'text-blue-900'} mb-4 font-cyber-title tracking-wide`}>
                Une expérience d'apprentissage <span className={`${isFuturistic ? 'text-cyan-400' : 'text-blue-600'} relative`}>
                  inégalée
                  <svg className="absolute bottom-0 left-0 w-full" height="5" viewBox="0 0 200 5" preserveAspectRatio="none">
                    <path d="M0 5 Q 40 0, 80 2 T 160 3 T 200 0 V 5 H 0 Z" fill={isFuturistic ? "rgba(34, 211, 238, 0.4)" : "rgba(37, 99, 235, 0.4)"} />
                  </svg>
                </span>
              </h2>
              <p className={`text-xl ${isFuturistic ? 'text-blue-100/90' : 'text-slate-700'} max-w-3xl mx-auto font-cyber-body`}>
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
      
      {/* Call-to-Action avec style adaptatif */}
      <div className={`${isFuturistic ? 'bg-gradient-to-b from-blue-950 to-indigo-950' : 'bg-gradient-to-b from-blue-500 to-blue-600'} py-20 relative overflow-hidden`}>
        {/* Éléments décoratifs futuristes - uniquement en mode futuriste */}
        {isFuturistic && (
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {/* Cercles lumineux */}
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-3xl"></div>
            
            {/* Lignes de grille */}
            <div className="absolute inset-0">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
                <defs>
                  <pattern id="smallgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallgrid)" />
              </svg>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className={`${isFuturistic 
              ? 'bg-blue-950/40 backdrop-blur-sm border border-blue-500/20' 
              : 'bg-white border border-gray-200'} 
              px-8 py-12 rounded-xl shadow-xl`}
          >
            <h2 className={`text-3xl sm:text-4xl font-bold ${isFuturistic ? 'text-white' : 'text-blue-800'} mb-6 font-cyber-title tracking-wide`}>
              Prêt à <span className={`${isFuturistic ? 'text-cyan-400' : 'text-blue-500'}`}>transformer</span> votre parcours ?
            </h2>
            <p className={`text-xl ${isFuturistic ? 'text-blue-100/90' : 'text-slate-600'} mb-10 max-w-3xl mx-auto font-cyber-body`}>
              Rejoignez plus de 1000 professionnels qui ont déjà révolutionné leur façon d'apprendre
            </p>
            
            {/* Bouton d'action adaptatif */}
            <Link href="/cyber">
              <Button className={`${isFuturistic 
                ? 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400/80 hover:to-blue-500/80 border border-cyan-400/30' 
                : 'bg-blue-600 hover:bg-blue-700 border-none'} 
                text-white font-cyber-accent px-8 py-6 text-lg group relative overflow-hidden rounded-xl`}>
                {isFuturistic && (
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-300/20 to-transparent group-hover:w-full transition-all duration-700 ease-out"></span>
                )}
                <span className="relative z-10 flex items-center">
                  Commencer maintenant 
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
            
            {/* Ligne décorative en bas - uniquement en mode futuriste */}
            {isFuturistic && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Section Footer - Style adaptatif */}
      <footer className={`${isFuturistic ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-800'} pt-16 pb-8 relative overflow-hidden`}>
        {/* Fond étoilé subtil - uniquement en mode futuriste */}
        {isFuturistic && (
          <div className="absolute inset-0 z-0 opacity-20">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.max(1, Math.random() * 2)}px`,
                  height: `${Math.max(1, Math.random() * 2)}px`,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
                  opacity: Math.random() * 0.5 + 0.3
                }}
              />
            ))}
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Logo et description */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-2">
                <div className={`h-8 w-8 ${isFuturistic ? 'text-cyan-400' : 'text-blue-600'} mr-2 relative`}>
                  {isFuturistic && (
                    <div className="absolute inset-0 bg-cyan-400 rounded-full filter blur-sm opacity-30"></div>
                  )}
                </div>
                <span className={`text-xl font-bold font-cyber-title tracking-wide ${isFuturistic ? 'text-white' : 'text-blue-800'}`}>FYNE</span>
              </div>
              <div className={`mb-3 ${isFuturistic ? 'text-cyan-400/80' : 'text-blue-500'} italic text-sm font-cyber-accent tracking-wide`}>
                For Your Next Experience
              </div>
              <p className={`${isFuturistic ? 'text-blue-200/60' : 'text-gray-600'} mb-4 font-cyber-body`}>
                Une plateforme d'apprentissage nouvelle génération alimentée par l'intelligence artificielle avancée
              </p>
            </div>
            
            {/* Liens rapides */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isFuturistic ? 'text-cyan-300' : 'text-blue-700'} font-cyber-accent`}>Modules</h3>
              <ul className="space-y-2">
                {['I AM CYBER', 'CENTRE DE CRISE ÉVOLUTIF', 'I AM DATA & IA', 'IAM mc2i', 'Personnalisé'].map(link => (
                  <li key={link}>
                    <a href="#" className={`${isFuturistic ? 'text-blue-200/60 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-800'} transition-colors`}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isFuturistic ? 'text-cyan-300' : 'text-blue-700'} font-cyber-accent`}>Support</h3>
              <ul className="space-y-2">
                {['Documentation', 'FAQ', 'Communauté', 'Tutoriels', 'Contact'].map(link => (
                  <li key={link}>
                    <a href="#" className={`${isFuturistic ? 'text-blue-200/60 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-800'} transition-colors`}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Newsletter */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isFuturistic ? 'text-cyan-300' : 'text-blue-700'} font-cyber-accent`}>Restez informé</h3>
              <p className={`${isFuturistic ? 'text-blue-200/60' : 'text-gray-600'} mb-4 font-cyber-body`}>
                Recevez les dernières mises à jour sur nos modules et fonctionnalités
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className={`${isFuturistic 
                    ? 'bg-gray-900 border-blue-900/80 text-blue-100 focus:ring-cyan-500' 
                    : 'bg-white border-gray-200 text-gray-800 focus:ring-blue-500'} 
                    border px-3 py-2 rounded-l-xl w-full focus:outline-none focus:ring-1`}
                />
                <button className={`${isFuturistic ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'} 
                  px-4 py-2 rounded-r-xl transition-colors text-white`}>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Barre de séparation */}
          <div className={`border-t ${isFuturistic ? 'border-blue-900/40' : 'border-gray-300'} pt-8 pb-4`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className={`${isFuturistic ? 'text-blue-200/40' : 'text-gray-500'} text-sm mb-4 md:mb-0 font-cyber-body`}>
                © {new Date().getFullYear()} FYNE. Tous droits réservés.
              </p>
              <div className="flex space-x-6">
                {['Conditions d\'utilisation', 'Politique de confidentialité', 'Cookies'].map(item => (
                  <a 
                    key={item} 
                    href="#" 
                    className={`${isFuturistic 
                      ? 'text-blue-200/40 hover:text-cyan-300' 
                      : 'text-gray-500 hover:text-blue-600'} 
                      text-sm transition-colors font-cyber-body`}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Suppression de la bannière flottante */}
      
      {/* Modale de mot de passe pour tous les modules */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className={`sm:max-w-md ${isFuturistic ? 'bg-gradient-to-b from-blue-950 to-indigo-950 text-white border border-blue-500/30 backdrop-blur-sm' : 'bg-white text-gray-800'}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${isFuturistic ? 'text-cyan-300' : 'text-blue-600'}`}>
              <Lock className="h-5 w-5" />
              Accès Sécurisé
            </DialogTitle>
            <DialogDescription className={isFuturistic ? 'text-gray-300' : 'text-gray-600'}>
              Veuillez saisir le mot de passe pour accéder aux modules.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            {/* Icône de sécurité */}
            <div className="w-full flex justify-center mb-2">
              <div className={`rounded-full p-3 ${isFuturistic ? 'bg-blue-900/60 text-cyan-300' : 'bg-blue-100 text-blue-600'}`}>
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
            
            <Input
              type="password"
              placeholder="Entrez le mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${isFuturistic ? 'bg-blue-900/30 border-blue-700/50 text-white placeholder-blue-300/40' : 'bg-white border-gray-300'}`}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordCheck()}
            />
            
            {passwordError && (
              <div className={`text-sm flex items-center gap-2 ${isFuturistic ? 'text-red-300' : 'text-red-500'}`}>
                <AlertTriangle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPassword('');
                setPasswordError('');
              }}
              className={isFuturistic ? 'bg-transparent hover:bg-blue-900/30 border-blue-700/50 text-blue-300' : ''}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handlePasswordCheck}
              className={`${isFuturistic ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 border border-blue-500/30' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Accéder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}