import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, 
  AlertCircle, Clock, Zap, MessageSquare, Filter, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  icon: "phishing" | "ransomware" | "data-breach" | "social-engineering" | "apt" | "zero-day";
}

// Composant pour la carte de mission
const MissionCard = ({ mission }: { mission: Mission }) => {
  const [isHover, setIsHover] = useState(false);
  
  // Mapping des icônes
  const iconMap = {
    "phishing": <AlertCircle className="w-5 h-5" />,
    "ransomware": <FileWarning className="w-5 h-5" />,
    "data-breach": <Database className="w-5 h-5" />,
    "social-engineering": <Users className="w-5 h-5" />,
    "apt": <AlertTriangle className="w-5 h-5" />,
    "zero-day": <Zap className="w-5 h-5" />
  };
  
  // Mapping des couleurs de fond en fonction du niveau de difficulté
  const difficultyColor = {
    "Débutant": "bg-[#00afab]/20 text-[#00afab]",
    "Intermédiaire": "bg-[#46cada]/20 text-[#006a9e]",
    "Expert": "bg-[#dd0061]/20 text-[#dd0061]"
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
          <div className="w-10 h-10 rounded-lg bg-[#006a9e]/10 flex items-center justify-center text-[#006a9e]">
            {iconMap[mission.icon]}
          </div>
          <Badge className={difficultyColor[mission.difficulty]}>
            {mission.difficulty}
          </Badge>
          <Badge variant="outline" className="ml-auto bg-white border-[#006a9e]/30 text-[#006a9e]">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#006a9e]" /> {mission.duration}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-gray-900">{mission.title}</h3>
        <p className="text-gray-600 mb-4 text-sm flex-grow">{mission.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2 mb-6">
          {mission.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-[#46cada]/10 text-[#006a9e] font-medium rounded-full border border-[#46cada]/20">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-auto">
          <Link href={`/cyber-defense/mission/${mission.id}`}>
            <Button 
              variant="default" 
              className="w-full bg-[#006a9e] hover:bg-[#003a5d] group"
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
  // Liste des missions disponibles
  const missions: Mission[] = [
    {
      id: "phishing-campaign",
      title: "Contrer une campagne de phishing massive",
      description: "Une campagne de phishing sophistiquée cible les employés de votre entreprise. En tant que responsable de la sécurité, vous devez prendre rapidement les bonnes décisions pour limiter l'impact et protéger l'organisation.",
      difficulty: "Débutant",
      duration: "15-20 min",
      tags: ["Phishing", "Sensibilisation", "Communication de crise"],
      icon: "phishing"
    },
    {
      id: "ransomware-attack",
      title: "Gestion d'une attaque par ransomware",
      description: "Des fichiers critiques ont été chiffrés et une demande de rançon a été reçue. Coordonnez la réponse à l'incident en prenant des décisions cruciales entre paiement, restauration et analyse forensique.",
      difficulty: "Intermédiaire",
      duration: "25-30 min",
      tags: ["Ransomware", "Gestion de crise", "Continuité d'activité"],
      icon: "ransomware"
    },
    {
      id: "data-breach",
      title: "Fuite de données sensibles",
      description: "Une fuite de données clients a été détectée. Dirigez l'équipe d'investigation pour comprendre l'étendue du problème, limiter les dégâts et communiquer efficacement auprès des parties prenantes.",
      difficulty: "Intermédiaire",
      duration: "20-25 min",
      tags: ["Protection des données", "RGPD", "Communication"],
      icon: "data-breach"
    },
    {
      id: "social-engineering",
      title: "Infiltration par ingénierie sociale",
      description: "Un attaquant a réussi à obtenir des informations sensibles en se faisant passer pour un membre de la direction. Découvrez comment l'attaque s'est déroulée et mettez en place les mesures correctives.",
      difficulty: "Débutant",
      duration: "15-20 min",
      tags: ["Ingénierie sociale", "Formation", "Procédures"],
      icon: "social-engineering"
    },
    {
      id: "apt-defense",
      title: "Détection d'une APT (Advanced Persistent Threat)",
      description: "Des activités suspectes indiquent la présence d'un acteur malveillant sophistiqué dans votre réseau depuis plusieurs mois. Dirigez l'investigation et la réponse à cette menace avancée.",
      difficulty: "Expert",
      duration: "30-40 min",
      tags: ["APT", "Threat hunting", "Analyse de compromission"],
      icon: "apt"
    },
    {
      id: "zero-day-vuln",
      title: "Exploitation d'une vulnérabilité zero-day",
      description: "Une vulnérabilité critique non documentée a été exploitée dans votre infrastructure. Gérez la situation d'urgence en collaborant avec différentes équipes et prestataires externes.",
      difficulty: "Expert",
      duration: "25-35 min",
      tags: ["Vulnérabilité", "Patch management", "Analyse d'exploitation"],
      icon: "zero-day"
    }
  ];
  
  const [filter, setFilter] = useState<string>("all");
  
  // Filtrer les missions en fonction du niveau de difficulté
  const filteredMissions = filter === "all" 
    ? missions 
    : missions.filter(mission => mission.difficulty.toLowerCase() === filter);
  
  return (
    <HomeLayout>
      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#003a5d] to-[#006a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour à I AM CYBER
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#00afab]/40 text-[#e6f7f7] border-[#00afab]/30 mb-6">
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
                className="text-xl text-[#e6f7f7] mb-8 max-w-xl"
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
                  <span className="text-3xl font-bold">6</span>
                  <span className="text-[#46cada]">Missions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">3</span>
                  <span className="text-[#46cada]">Niveaux</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">15+</span>
                  <span className="text-[#46cada]">PNJ</span>
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
                <div className="absolute inset-0 bg-[#46cada]/30 rounded-full animate-pulse"></div>
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
                    <TabsTrigger 
                      value="all" 
                      className="border-b-2 border-transparent text-[#006a9e]/60 hover:text-[#006a9e]/80
                                data-[state=active]:bg-[#006a9e]/10 
                                data-[state=active]:text-[#006a9e] 
                                data-[state=active]:border-[#006a9e] 
                                data-[state=active]:font-medium"
                    >
                      Toutes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="débutant" 
                      className="border-b-2 border-transparent text-[#00afab]/60 hover:text-[#00afab]/80
                                data-[state=active]:bg-[#00afab]/20 
                                data-[state=active]:text-[#00afab] 
                                data-[state=active]:border-[#00afab] 
                                data-[state=active]:font-medium"
                    >
                      Débutant
                    </TabsTrigger>
                    <TabsTrigger 
                      value="intermédiaire" 
                      className="border-b-2 border-transparent text-[#006a9e]/60 hover:text-[#006a9e]/80
                                data-[state=active]:bg-[#46cada]/20 
                                data-[state=active]:text-[#006a9e] 
                                data-[state=active]:border-[#006a9e] 
                                data-[state=active]:font-medium"
                    >
                      Intermédiaire
                    </TabsTrigger>
                    <TabsTrigger 
                      value="expert" 
                      className="border-b-2 border-transparent text-[#dd0061]/60 hover:text-[#dd0061]/80
                                data-[state=active]:bg-[#dd0061]/20 
                                data-[state=active]:text-[#dd0061] 
                                data-[state=active]:border-[#dd0061] 
                                data-[state=active]:font-medium"
                    >
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
                icon: <Shield size={40} className="text-[#006a9e]" />
              },
              {
                title: "2. Analysez et décidez",
                description: "Évaluez la situation, interagissez avec votre équipe virtuelle et prenez des décisions critiques qui influenceront l'évolution du scénario.",
                icon: <User size={40} className="text-[#006a9e]" />
              },
              {
                title: "3. Observez les résultats",
                description: "Voyez les conséquences de vos choix se dérouler et adaptez votre stratégie en fonction des nouvelles informations et défis.",
                icon: <MessageSquare size={40} className="text-[#006a9e]" />
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
      <div className="bg-gradient-to-r from-[#003a5d] to-[#006a9e] py-16">
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
            <p className="text-xl text-[#e6f7f7] mb-8 max-w-3xl mx-auto">
              Mettez à l'épreuve vos compétences en cybersécurité dans des situations réalistes et développez votre capacité à prendre des décisions sous pression.
            </p>
            
            <Link href="#missions">
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-100 text-[#006a9e]"
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