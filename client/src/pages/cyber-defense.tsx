import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, 
  AlertCircle, Clock, Zap, MessageSquare, Filter, ArrowRight, ArrowLeft,
  Network, ClipboardCheck, KeyRound, Cloud, AlertOctagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  icon: "phishing" | "ransomware" | "data-breach" | "social-engineering" | "apt" | "zero-day" | "strategy" | "compliance" | "supply-chain" | "identity" | "cloud" | "crisis";
  comingSoon?: boolean;
  companyName: string;
  secteurActivite: string;
  scenario: string;
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
    "zero-day": <Zap className="w-5 h-5" />,
    "strategy": <Network className="w-5 h-5" />,
    "compliance": <ClipboardCheck className="w-5 h-5" />,
    "supply-chain": <ArrowRight className="w-5 h-5" />,
    "identity": <KeyRound className="w-5 h-5" />,
    "cloud": <Cloud className="w-5 h-5" />,
    "crisis": <AlertOctagon className="w-5 h-5" />
  };
  
  // Mapping des couleurs de fond en fonction du niveau de difficulté
  const difficultyColor = {
    "Débutant": "bg-[#006a9e]/10 text-[#006a9e]",
    "Intermédiaire": "bg-[#006a9e]/20 text-[#006a9e]",
    "Expert": "bg-[#006a9e]/30 text-[#006a9e]"
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
        <p className="text-gray-500 text-xs mb-2">{mission.companyName} - {mission.secteurActivite}</p>
        <p className="text-gray-600 mb-4 text-sm flex-grow">{mission.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-2 mb-6">
          {mission.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-[#006a9e]/10 text-[#006a9e] font-medium rounded-full border border-[#006a9e]/20">
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
    // Missions existantes
    {
      id: "phishing-campaign",
      title: "Contrer une campagne de phishing massive",
      description: "Une campagne de phishing sophistiquée cible les employés de votre entreprise. En tant que responsable de la sécurité, vous devez prendre rapidement les bonnes décisions pour limiter l'impact et protéger l'organisation.",
      difficulty: "Débutant",
      duration: "15-20 min",
      tags: ["Phishing", "Sensibilisation", "Communication de crise"],
      icon: "phishing",
      companyName: "ELITE RETAIL SECURITY",
      secteurActivite: "RETAIL & LUXE",
      scenario: "Une campagne de phishing sophistiquée cible les employés de votre entreprise. Vous devez agir rapidement pour limiter l'impact."
    },
    {
      id: "ransomware-attack",
      title: "Gestion d'une attaque par ransomware",
      description: "Des fichiers critiques ont été chiffrés et une demande de rançon a été reçue. Coordonnez la réponse à l'incident en prenant des décisions cruciales entre paiement, restauration et analyse forensique.",
      difficulty: "Intermédiaire",
      duration: "25-30 min",
      tags: ["Ransomware", "Gestion de crise", "Continuité d'activité"],
      icon: "ransomware",
      companyName: "SECURE FINANCE SOLUTIONS",
      secteurActivite: "BANCAIRE/FINANCIER (BFA)",
      scenario: "Des fichiers critiques ont été chiffrés et une demande de rançon a été reçue. Coordonnez la réponse à cet incident."
    },
    {
      id: "data-breach",
      title: "Fuite de données sensibles",
      description: "Une fuite de données clients a été détectée. Dirigez l'équipe d'investigation pour comprendre l'étendue du problème, limiter les dégâts et communiquer efficacement auprès des parties prenantes.",
      difficulty: "Intermédiaire",
      duration: "20-25 min",
      tags: ["Protection des données", "RGPD", "Communication"],
      icon: "data-breach",
      companyName: "HEALTH & INDUSTRY SHIELD",
      secteurActivite: "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
      scenario: "Une fuite de données clients a été détectée. Dirigez l'équipe d'investigation pour limiter les dégâts."
    },
    {
      id: "social-engineering",
      title: "Infiltration par ingénierie sociale",
      description: "Un attaquant a réussi à obtenir des informations sensibles en se faisant passer pour un membre de la direction. Découvrez comment l'attaque s'est déroulée et mettez en place les mesures correctives.",
      difficulty: "Débutant",
      duration: "15-20 min",
      tags: ["Ingénierie sociale", "Formation", "Procédures"],
      icon: "social-engineering",
      companyName: "CYBER SECURE SOLUTIONS",
      secteurActivite: "ÉNERGIE & UTILITIES",
      scenario: "Un attaquant a réussi à obtenir des informations sensibles en se faisant passer pour un membre de la direction."
    },
    {
      id: "apt-defense",
      title: "Détection d'une APT (Advanced Persistent Threat)",
      description: "Des activités suspectes indiquent la présence d'un acteur malveillant sophistiqué dans votre réseau depuis plusieurs mois. Dirigez l'investigation et la réponse à cette menace avancée.",
      difficulty: "Expert",
      duration: "30-40 min",
      tags: ["APT", "Threat hunting", "Analyse de compromission"],
      icon: "apt",
      companyName: "ELITE RETAIL SECURITY",
      secteurActivite: "RETAIL & LUXE",
      scenario: "Des activités suspectes indiquent la présence d'un acteur malveillant sophistiqué dans votre réseau depuis plusieurs mois."
    },
    {
      id: "zero-day-vuln",
      title: "Exploitation d'une vulnérabilité zero-day",
      description: "Une vulnérabilité critique non documentée a été exploitée dans votre infrastructure. Gérez la situation d'urgence en collaborant avec différentes équipes et prestataires externes.",
      difficulty: "Expert",
      duration: "25-35 min",
      tags: ["Vulnérabilité", "Patch management", "Analyse d'exploitation"],
      icon: "zero-day",
      companyName: "SECURE FINANCE SOLUTIONS",
      secteurActivite: "BANCAIRE/FINANCIER (BFA)",
      scenario: "Une vulnérabilité critique non documentée a été exploitée dans votre infrastructure. Gérez la situation d'urgence."
    },
    
    // Nouvelles missions - Stratégie cyber
    {
      id: "cyber-strategy",
      title: "Définir la stratégie cybersécurité",
      description: "En tant que RSSI, élaborez une stratégie de cybersécurité adaptée aux besoins de l'entreprise en tenant compte des contraintes budgétaires, réglementaires et opérationnelles.",
      difficulty: "Intermédiaire",
      duration: "25-30 min",
      tags: ["Stratégie cyber", "Gouvernance", "Planification"],
      icon: "strategy",
      companyName: "CYBER SECURE SOLUTIONS",
      secteurActivite: "ÉNERGIE & UTILITIES",
      scenario: "Élaborez une stratégie de cybersécurité adaptée aux besoins de l'entreprise.",
      comingSoon: true
    },
    
    // Conformité cyber
    {
      id: "cyber-compliance",
      title: "Audit de conformité réglementaire",
      description: "Votre entreprise fait face à un audit de conformité cybersécurité. Préparez votre organisation pour répondre aux exigences réglementaires et éviter les sanctions.",
      difficulty: "Intermédiaire",
      duration: "20-25 min",
      tags: ["Conformité", "Audit", "Réglementation"],
      icon: "compliance",
      companyName: "HEALTH & INDUSTRY SHIELD",
      secteurActivite: "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
      scenario: "Préparez votre organisation pour répondre aux exigences réglementaires et éviter les sanctions.",
      comingSoon: true
    },
    
    // Sécurité supply chain
    {
      id: "supply-chain-security",
      title: "Compromission dans la chaîne d'approvisionnement",
      description: "Un fournisseur stratégique a été compromis, exposant potentiellement votre entreprise à des risques. Gérez cette crise affectant votre chaîne d'approvisionnement informatique.",
      difficulty: "Expert",
      duration: "25-35 min",
      tags: ["Supply Chain", "Fournisseurs", "Analyse de risques"],
      icon: "supply-chain",
      companyName: "ELITE RETAIL SECURITY",
      secteurActivite: "RETAIL & LUXE",
      scenario: "Un fournisseur stratégique a été compromis, exposant potentiellement votre entreprise à des risques.",
      comingSoon: true
    },
    
    // IAM (Identity & Access Management)
    {
      id: "identity-breach",
      title: "Compromission des accès privilégiés",
      description: "Les identifiants d'un administrateur système ont été compromis. Menez l'enquête et mettez en place une stratégie de gestion des identités et des accès plus robuste.",
      difficulty: "Intermédiaire",
      duration: "20-30 min",
      tags: ["IAM", "Accès privilégiés", "Authentification"],
      icon: "identity",
      companyName: "SECURE FINANCE SOLUTIONS",
      secteurActivite: "BANCAIRE/FINANCIER (BFA)",
      scenario: "Les identifiants d'un administrateur système ont été compromis. Menez l'enquête et résolvez la situation.",
      comingSoon: true
    },
    
    // Cybersécurité cloud
    {
      id: "cloud-security-incident",
      title: "Incident de sécurité dans le cloud",
      description: "Une configuration incorrecte a exposé des données sensibles stockées dans votre infrastructure cloud. Menez l'investigation et établissez un plan de remédiation.",
      difficulty: "Expert",
      duration: "25-35 min",
      tags: ["Cloud", "Configuration", "Données sensibles"],
      icon: "cloud",
      companyName: "HEALTH & INDUSTRY SHIELD",
      secteurActivite: "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
      scenario: "Une configuration incorrecte a exposé des données sensibles stockées dans votre infrastructure cloud.",
      comingSoon: true
    },
    
    // Gestion de crise avancée
    {
      id: "major-crisis",
      title: "Crise cybersécurité majeure",
      description: "Une attaque sophistiquée à grande échelle affecte toutes les opérations de l'entreprise. Dirigez la cellule de crise et prenez des décisions stratégiques sous pression.",
      difficulty: "Expert",
      duration: "30-40 min",
      tags: ["Gestion de crise", "Communication", "Reprise d'activité"],
      icon: "crisis",
      companyName: "CYBER SECURE SOLUTIONS",
      secteurActivite: "ÉNERGIE & UTILITIES",
      scenario: "Une attaque sophistiquée à grande échelle affecte toutes les opérations de l'entreprise.",
      comingSoon: true
    }
  ];
  
  const [filter, setFilter] = useState<string>("all");
  
  // Filtrer les missions en fonction du niveau de difficulté
  const filteredMissions = filter === "all" 
    ? missions 
    : missions.filter(mission => mission.difficulty.toLowerCase() === filter);
  
  return (
    <HomeLayout>
      <PageTitle title="CYBER DEFENSE" />
      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#003a5d] to-[#006a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <Link href="/cyber" className="inline-flex items-center text-white hover:text-[#006a9e] mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour à I AM CYBER
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#006a9e]/40 text-white border-[#006a9e]/30 mb-6">
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
                className="text-xl text-white mb-8 max-w-xl"
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
                  <span className="text-3xl font-bold">12</span>
                  <span className="text-[#006a9e]">Missions</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">3</span>
                  <span className="text-[#006a9e]">Niveaux</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">11+</span>
                  <span className="text-[#006a9e]">PNJ</span>
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
                <div className="absolute inset-0 bg-[#006a9e]/30 rounded-full animate-pulse"></div>
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
                      className="border-b-2 border-transparent text-[#006a9e]/60 hover:text-[#006a9e]/80
                                data-[state=active]:bg-[#006a9e]/20 
                                data-[state=active]:text-[#006a9e] 
                                data-[state=active]:border-[#006a9e] 
                                data-[state=active]:font-medium"
                    >
                      Débutant
                    </TabsTrigger>
                    <TabsTrigger 
                      value="intermédiaire" 
                      className="border-b-2 border-transparent text-[#006a9e]/60 hover:text-[#006a9e]/80
                                data-[state=active]:bg-[#006a9e]/20 
                                data-[state=active]:text-[#006a9e] 
                                data-[state=active]:border-[#006a9e] 
                                data-[state=active]:font-medium"
                    >
                      Intermédiaire
                    </TabsTrigger>
                    <TabsTrigger 
                      value="expert" 
                      className="border-b-2 border-transparent text-[#006a9e]/60 hover:text-[#006a9e]/80
                                data-[state=active]:bg-[#006a9e]/20 
                                data-[state=active]:text-[#006a9e] 
                                data-[state=active]:border-[#006a9e] 
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
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
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