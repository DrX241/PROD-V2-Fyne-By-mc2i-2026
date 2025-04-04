import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, ScrollText,
  AlertCircle, Clock, Zap, MessageSquare, Filter, ArrowRight, GraduationCap, Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import { cyberDefenseMissions } from '@/data/cyber-defense-missions';

// Type pour la carte de mission simplifiée
interface SimpleMission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  icon?: "phishing" | "ransomware" | "data-breach" | "social-engineering" | "apt" | "zero-day" | "rgpd" | "compliance" | "data-governance";
}

// Fonction pour déduire une icône à partir des tags de la mission
const getIconFromTags = (tags: string[]): "phishing" | "ransomware" | "data-breach" | "social-engineering" | "apt" | "zero-day" | "rgpd" | "compliance" | "data-governance" => {
  const tagLowerCase = tags.map(tag => tag.toLowerCase());
  
  if (tagLowerCase.includes("phishing")) return "phishing";
  if (tagLowerCase.includes("ransomware")) return "ransomware";
  if (tagLowerCase.includes("rgpd") || tagLowerCase.includes("gdpr")) return "rgpd";
  if (tagLowerCase.includes("données") || tagLowerCase.includes("data-breach") || tagLowerCase.includes("protection des données")) return "data-breach";
  if (tagLowerCase.includes("social") || tagLowerCase.includes("ingénierie sociale")) return "social-engineering";
  if (tagLowerCase.includes("apt") || tagLowerCase.includes("menace persistante")) return "apt";
  if (tagLowerCase.includes("zero-day") || tagLowerCase.includes("vulnérabilité")) return "zero-day";
  if (tagLowerCase.includes("conformité") || tagLowerCase.includes("compliance")) return "compliance";
  if (tagLowerCase.includes("gouvernance") || tagLowerCase.includes("governance")) return "data-governance";
  
  // Par défaut
  return "data-breach";
};

// Composant pour la carte de mission
const MissionCard = ({ mission }: { mission: SimpleMission }) => {
  const [isHover, setIsHover] = useState(false);
  
  // Mapping des icônes
  const iconMap: Record<string, React.ReactNode> = {
    "phishing": <AlertCircle className="w-5 h-5" />,
    "ransomware": <FileWarning className="w-5 h-5" />,
    "data-breach": <Database className="w-5 h-5" />,
    "social-engineering": <Users className="w-5 h-5" />,
    "apt": <AlertTriangle className="w-5 h-5" />,
    "zero-day": <Zap className="w-5 h-5" />,
    "rgpd": <ScrollText className="w-5 h-5" />,
    "compliance": <GraduationCap className="w-5 h-5" />,
    "data-governance": <Network className="w-5 h-5" />
  };
  
  // Obtenir l'icône appropriée avec gestion des cas par défaut
  const getIcon = () => {
    if (mission.icon && iconMap[mission.icon]) {
      return iconMap[mission.icon];
    }
    
    // Essayer de déterminer l'icône à partir des tags
    const iconFromTags = getIconFromTags(mission.tags);
    return iconMap[iconFromTags] || <Database className="w-5 h-5" />; // Icône par défaut
  };
  
  // Mapping des couleurs de fond en fonction du niveau de difficulté
  const difficultyColor = {
    "Débutant": "bg-green-100 text-green-800",
    "Intermédiaire": "bg-amber-100 text-amber-800",
    "Expert": "bg-red-100 text-red-800"
  };
  
  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md transition-all duration-300 h-full"
      whileHover={{ 
        y: -5,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            {getIcon()}
          </div>
          <Badge className={difficultyColor[mission.difficulty]}>
            {mission.difficulty}
          </Badge>
          <Badge variant="outline" className="ml-auto">
            <Clock className="w-3.5 h-3.5 mr-1" /> {mission.duration}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-900">{mission.title}</h3>
        <p className="text-gray-600 mb-4 text-sm flex-grow">{mission.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2 mb-6">
          {mission.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-auto">
          <Link href={`/cyber-defense/mission/${mission.id}`}>
            <Button 
              variant="default" 
              className="w-full bg-green-600 hover:bg-green-700 group"
            >
              Commencer la mission
              <ArrowRight className={`ml-2 transition-all duration-300 ${isHover ? 'translate-x-1' : ''}`} />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function CyberDefense() {
  // Convertir les missions du format complexe au format simplifié pour l'affichage
  const missions: SimpleMission[] = cyberDefenseMissions.map(mission => ({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    difficulty: mission.difficulty as "Débutant" | "Intermédiaire" | "Expert",
    duration: mission.duration,
    tags: mission.tags
  }));
  
  const [filter, setFilter] = useState<string>("all");
  
  // Filtrer les missions en fonction du niveau de difficulté
  const filteredMissions = filter === "all" 
    ? missions 
    : missions.filter(mission => mission.difficulty.toLowerCase() === filter);
  
  return (
    <HomeLayout>
      {/* Hero section */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-green-600/40 text-green-100 border-green-500/30 mb-6">
                Nouveau module
              </Badge>
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                CYBER DEFENSE
              </motion.h1>
              <motion.p 
                className="text-xl text-green-100 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Prenez les commandes face aux menaces cybernétiques. Dans ce module, c'est <strong>vous</strong> qui décidez des actions à entreprendre tandis que les personnages non-joueurs exécutent vos directives.
              </motion.p>
              
              <motion.div 
                className="flex items-center gap-8 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">{missions.length}</span>
                  <span className="text-green-200">Missions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">3</span>
                  <span className="text-green-200">Niveaux</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">15+</span>
                  <span className="text-green-200">PNJ</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-32 h-32 lg:w-40 lg:h-40 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Missions section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Missions disponibles</h2>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Sélectionnez une mission et mettez-vous dans la peau d'un responsable cybersécurité face à des incidents critiques.
                </p>
              </div>
              
              <div className="mt-6 lg:mt-0">
                <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                  <TabsList className="bg-white border border-gray-200">
                    <TabsTrigger value="all" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      Toutes
                    </TabsTrigger>
                    <TabsTrigger value="débutant" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      Débutant
                    </TabsTrigger>
                    <TabsTrigger value="intermédiaire" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      Intermédiaire
                    </TabsTrigger>
                    <TabsTrigger value="expert" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      Expert
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          
          {/* Grid des missions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MissionCard mission={mission} />
              </motion.div>
            ))}
          </div>
          
          {filteredMissions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Aucune mission ne correspond à ce filtre.</p>
              <Button variant="outline" onClick={() => setFilter("all")}>
                <Filter className="mr-2 h-4 w-4" />
                Afficher toutes les missions
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Comment ça marche */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dans le module CYBER DEFENSE, vous êtes le décideur principal face à des menaces cybernétiques réelles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "1. Choisissez une mission",
                description: "Sélectionnez parmi différents scénarios de cybersécurité, chacun avec son niveau de complexité et ses enjeux spécifiques.",
                icon: <Shield size={40} className="text-green-600" />
              },
              {
                title: "2. Analysez et décidez",
                description: "Évaluez la situation, interagissez avec votre équipe virtuelle et prenez des décisions critiques qui influenceront l'évolution du scénario.",
                icon: <User size={40} className="text-green-600" />
              },
              {
                title: "3. Observez les résultats",
                description: "Voyez les conséquences de vos choix se dérouler et adaptez votre stratégie en fonction des nouvelles informations et défis.",
                icon: <MessageSquare size={40} className="text-green-600" />
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Prêt à relever le défi ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Mettez à l'épreuve vos compétences en cybersécurité dans des situations réalistes et développez votre capacité à prendre des décisions sous pression.
            </p>
            
            <Link href="#missions">
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-100 text-green-700"
              >
                Choisir une mission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}