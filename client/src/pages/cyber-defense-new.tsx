import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, 
  AlertCircle, Clock, Zap, MessageSquare, ArrowRight, ArrowLeft,
  Activity, Terminal, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { v4 as uuidv4 } from 'uuid';

// Structure d'un niveau de CENTRE DE CRISE
interface DefenseLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  scenario: string;
  duration: string;
  complexity: 'Basique' | 'Intermédiaire' | 'Avancé' | 'Expert';
  contactPerson: Contact;
  unlockedContacts: number; // Nombre d'interlocuteurs disponibles à ce niveau
  prerequisites: number[]; // Niveaux requis pour débloquer ce niveau
  skills: string[]; // Compétences développées dans ce niveau
  completed: boolean;
  locked: boolean;
}

// Structure d'un contact (interlocuteur)
interface Contact {
  id: string;
  name: string;
  role: string;
  expertise: string;
  avatarInitials: string;
  avatarColor: string;
  unlockedAtLevel: number; // Niveau auquel ce contact devient disponible
}

export default function CentreDeCriseEvolutif() {
  const [, navigate] = useLocation();
  
  // Liste des contacts disponibles dans le CENTRE DE CRISE
  // Ils seront débloqués progressivement au fil des niveaux
  const contacts: Contact[] = [
    {
      id: uuidv4(),
      name: "Yousra Saidani",
      role: "Senior Manager et Experte Cybersécurité",
      expertise: "Cybersécurité et Gestion de Crise",
      avatarInitials: "YS",
      avatarColor: "bg-[#006a9e]",
      unlockedAtLevel: 1 // Disponible dès le niveau 1 (premier contact)
    },
    {
      id: uuidv4(),
      name: "Thomas Blanc",
      role: "Administrateur Système",
      expertise: "Infrastructure et Réseau",
      avatarInitials: "TB",
      avatarColor: "bg-[#3182ce]",
      unlockedAtLevel: 2 // Disponible à partir du niveau 2
    },
    {
      id: uuidv4(),
      name: "Sophie Mercier",
      role: "Directrice Juridique",
      expertise: "RGPD et Conformité",
      avatarInitials: "SM",
      avatarColor: "bg-[#00537a]",
      unlockedAtLevel: 3
    },
    {
      id: uuidv4(),
      name: "Marion Lopez",
      role: "Responsable Communication",
      expertise: "Communication de Crise",
      avatarInitials: "ML",
      avatarColor: "bg-[#2c5282]",
      unlockedAtLevel: 4
    },
    {
      id: uuidv4(),
      name: "Alexandre Martin",
      role: "RSSI",
      expertise: "Gouvernance et Stratégie Sécurité",
      avatarInitials: "AM",
      avatarColor: "bg-[#1e3a8a]",
      unlockedAtLevel: 5
    },
    {
      id: uuidv4(),
      name: "Fatoumata Diallo",
      role: "Analyste SOC",
      expertise: "Détection et Réponse aux Incidents",
      avatarInitials: "FD",
      avatarColor: "bg-[#3b0764]",
      unlockedAtLevel: 6
    },
    {
      id: uuidv4(),
      name: "Richard Dupont",
      role: "DSI",
      expertise: "Stratégie IT et Transformation Digitale",
      avatarInitials: "RD",
      avatarColor: "bg-[#0f172a]",
      unlockedAtLevel: 7
    }
  ];
  
  // Liste des niveaux du CENTRE DE CRISE
  const levels: DefenseLevel[] = [
    // Niveau 1: Première alerte - Premier contact uniquement (Yousra)
    {
      id: uuidv4(),
      levelNumber: 1,
      title: "Alerte Phishing",
      description: "Un email suspect a été signalé par un employé. Identifiez la menace et prenez les premières mesures.",
      scenario: "Un employé vient de signaler avoir reçu un email suspect lui demandant de changer son mot de passe via un lien externe. Plusieurs autres employés ont peut-être reçu le même message.",
      duration: "10-15 min",
      complexity: "Basique",
      contactPerson: contacts[0], // Yousra Saidani
      unlockedContacts: 1, // Seul Yousra est disponible au niveau 1
      prerequisites: [], // Pas de prérequis pour le niveau 1
      skills: ["Analyse de phishing", "Communication d'incident"],
      completed: false,
      locked: false
    },
    
    // Niveau 2: Compromission de compte - Ajoute un interlocuteur technique
    {
      id: uuidv4(),
      levelNumber: 2,
      title: "Compromission de Compte",
      description: "Un compte utilisateur a été compromis. Travaillez avec l'administrateur système pour contenir l'incident.",
      scenario: "Suite à la campagne de phishing, un compte utilisateur privilégié semble avoir été compromis. Des activités suspectes ont été détectées sur le réseau interne.",
      duration: "15-20 min",
      complexity: "Basique",
      contactPerson: contacts[0],
      unlockedContacts: 2, // Yousra + Thomas (admin système)
      prerequisites: [1], // Nécessite d'avoir complété le niveau 1
      skills: ["Gestion d'identité", "Détection d'intrusion", "Confinement"],
      completed: false,
      locked: true
    },
    
    // Niveau 3: Exfiltration de données - Ajoute un interlocuteur juridique
    {
      id: uuidv4(),
      levelNumber: 3,
      title: "Exfiltration de Données",
      description: "Des données sensibles sont en cours d'exfiltration. Coordonnez-vous avec l'équipe juridique pour une réponse conforme.",
      scenario: "Les logs révèlent qu'une exfiltration de données clients est en cours. Vous devez agir rapidement tout en respectant les obligations légales de notification.",
      duration: "20-25 min",
      complexity: "Intermédiaire",
      contactPerson: contacts[0],
      unlockedContacts: 3, // Yousra + Thomas + Sophie (juridique)
      prerequisites: [2], // Nécessite d'avoir complété le niveau 2
      skills: ["RGPD", "Forensics", "Communication avec les autorités"],
      completed: false,
      locked: true
    },
    
    // Niveau 4: Communication de crise - Ajoute un interlocuteur communication
    {
      id: uuidv4(),
      levelNumber: 4,
      title: "Communication de Crise",
      description: "L'incident est devenu public. Travaillez avec la communication pour gérer les relations externes.",
      scenario: "Un journaliste a contacté l'entreprise suite à une fuite sur les réseaux sociaux concernant l'incident. Vous devez préparer une communication de crise.",
      duration: "20-25 min",
      complexity: "Intermédiaire",
      contactPerson: contacts[0],
      unlockedContacts: 4, // Ajoute Marion (communication)
      prerequisites: [3], // Nécessite d'avoir complété le niveau 3
      skills: ["Communication de crise", "Relations presse", "Réputation"],
      completed: false,
      locked: true
    },
    
    // Niveau 5: Ransomware débutant - Ajoute le RSSI
    {
      id: uuidv4(),
      levelNumber: 5,
      title: "Alerte Ransomware",
      description: "Des signes précurseurs de ransomware ont été détectés. Mettez en place une stratégie de défense proactive.",
      scenario: "Des comportements suspects indiquent qu'une attaque par ransomware pourrait être imminente. Le RSSI vous demande de coordonner la réponse préventive.",
      duration: "25-30 min",
      complexity: "Intermédiaire",
      contactPerson: contacts[0],
      unlockedContacts: 5, // Ajoute Alexandre (RSSI)
      prerequisites: [4], // Nécessite d'avoir complété le niveau 4
      skills: ["Défense anti-ransomware", "Sauvegarde et restauration", "Planification d'urgence"],
      completed: false,
      locked: true
    },
    
    // Niveau 6: Attaque en cours - Ajoute l'analyste SOC
    {
      id: uuidv4(),
      levelNumber: 6,
      title: "Attaque Active",
      description: "Une attaque avancée est en cours sur vos systèmes critiques. Travaillez avec l'équipe SOC pour la contrer.",
      scenario: "Le SOC a détecté des indicateurs de compromission avancés sur plusieurs systèmes critiques. Une attaque APT est soupçonnée.",
      duration: "30-40 min",
      complexity: "Avancé",
      contactPerson: contacts[0],
      unlockedContacts: 6, // Ajoute Fatoumata (SOC)
      prerequisites: [5], // Nécessite d'avoir complété le niveau 5
      skills: ["Threat hunting", "Détection d'APT", "Analyse de malware"],
      completed: false,
      locked: true
    },
    
    // Niveau 7: Crise majeure - Tous les interlocuteurs sont impliqués
    {
      id: uuidv4(),
      levelNumber: 7,
      title: "Crise Majeure",
      description: "Une attaque à large spectre touche l'ensemble de l'infrastructure. Coordonnez la réponse avec tous les interlocuteurs.",
      scenario: "Une attaque sophistiquée a touché tous les systèmes critiques. Le DSI a convoqué une cellule de crise que vous devez piloter.",
      duration: "45-60 min",
      complexity: "Expert",
      contactPerson: contacts[0],
      unlockedContacts: 7, // Tous les contacts sont disponibles
      prerequisites: [6], // Nécessite d'avoir complété le niveau 6
      skills: ["Gestion de crise", "Coordination d'équipe", "Stratégie de remédiation"],
      completed: false,
      locked: true
    }
  ];
  
  // État local pour le niveau actuellement sélectionné
  const [selectedLevel, setSelectedLevel] = useState<DefenseLevel | null>(null);
  
  // Calcul du pourcentage de progression global
  const completedLevels = levels.filter(level => level.completed).length;
  const totalLevels = levels.length;
  const progressPercentage = Math.round((completedLevels / totalLevels) * 100);
  
  // Démarrer un niveau spécifique
  const startLevel = (level: DefenseLevel) => {
    if (level.locked) return;
    navigate(`/cyber-defense/session/${level.id}`);
  };
  
  return (
    <HomeLayout>
      <PageTitle title="CENTRE DE CRISE" />
      
      {/* En-tête et introduction */}
      <div className="bg-gradient-to-br from-[#003a5d] to-[#006a9e] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-12 sm:px-6 lg:px-8">
          <Link href="/cyber" className="inline-flex items-center text-white hover:text-white/80 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour à I AM CYBER
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white text-[#006a9e] border-transparent mb-6">
                Module d'apprentissage progressif
              </Badge>
              
              <motion.h1 
                className="text-4xl sm:text-5xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                CENTRE DE CRISE
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Relevez des défis de cybersécurité de plus en plus complexes. Commencez avec un seul interlocuteur et déverrouillez de nouveaux experts au fur et à mesure de votre progression.
              </motion.p>
              
              <motion.div 
                className="flex items-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="mr-4">
                  <div className="text-sm text-white/80 mb-1">Votre progression</div>
                  <Progress value={progressPercentage} className="w-48 h-2 bg-white/20" />
                </div>
                <div className="text-white text-lg font-semibold">{progressPercentage}%</div>
              </motion.div>
              
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <Activity className="h-5 w-5 mr-2 text-white" />
                  <span className="text-white font-medium">{totalLevels} niveaux progressifs</span>
                </div>
                <div className="flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <Users className="h-5 w-5 mr-2 text-white" />
                  <span className="text-white font-medium">{contacts.length} experts à débloquer</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="hidden lg:flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-32 h-32 lg:w-40 lg:h-40 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Section des niveaux */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Parcours d'apprentissage</h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              Progressez à travers des défis de cybersécurité de plus en plus complexes. Chaque niveau débloque de nouveaux interlocuteurs experts pour enrichir votre expérience.
            </p>
          </div>
          
          {/* Grille des niveaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {levels.map((level, index) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => !level.locked && setSelectedLevel(level)}
                className={`bg-white border ${level.locked ? 'border-gray-200' : 'border-[#006a9e]/30'} 
                           rounded-xl overflow-hidden shadow-sm transition-all duration-300 
                           ${level.locked ? 'opacity-70' : 'hover:shadow-md cursor-pointer'}`}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${level.locked ? 'bg-gray-200' : 'bg-[#006a9e]'} flex items-center justify-center ${level.locked ? 'text-gray-500' : 'text-white'}`}>
                      {level.locked ? <Lock className="w-5 h-5" /> : <span className="text-lg font-semibold">{level.levelNumber}</span>}
                    </div>
                    
                    <Badge className={`${level.locked 
                      ? 'bg-gray-100 text-gray-500' 
                      : level.complexity === 'Basique' ? 'bg-[#006a9e]/20 text-[#006a9e]' 
                      : level.complexity === 'Intermédiaire' ? 'bg-[#006a9e]/40 text-[#006a9e]' 
                      : level.complexity === 'Avancé' ? 'bg-[#006a9e]/60 text-white' 
                      : 'bg-[#006a9e]/80 text-white'}`}
                    >
                      {level.complexity}
                    </Badge>
                    
                    {level.completed && (
                      <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
                        Complété
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${level.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                    {level.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 flex-grow ${level.locked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {level.description}
                  </p>
                  
                  {/* Interlocuteurs disponibles */}
                  <div className="mt-2 mb-4">
                    <div className={`text-xs font-medium mb-2 ${level.locked ? 'text-gray-400' : 'text-[#006a9e]'}`}>
                      Interlocuteurs disponibles:
                    </div>
                    <div className="flex -space-x-2">
                      {contacts
                        .filter(contact => contact.unlockedAtLevel <= level.unlockedContacts)
                        .slice(0, 5)
                        .map((contact, i) => (
                          <Avatar key={i} className={`w-8 h-8 border-2 border-white ${level.locked ? 'opacity-50' : ''}`}>
                            <AvatarFallback className={`text-xs text-white ${level.locked ? 'bg-gray-300' : contact.avatarColor}`}>
                              {contact.avatarInitials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      
                      {level.unlockedContacts > 5 && (
                        <Avatar className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className={`text-xs ${level.locked ? 'bg-gray-300 text-gray-500' : 'bg-[#006a9e] text-white'}`}>
                            +{level.unlockedContacts - 5}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                  
                  {/* Informations complémentaires */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> 
                      <span>{level.duration}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Terminal className="w-3.5 h-3.5 mr-1" />
                      <span>{level.skills.length} compétences</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <Button 
                      variant="default" 
                      className={`w-full ${
                        level.locked 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200' 
                          : 'bg-[#006a9e] hover:bg-[#004a7e] text-white'
                      }`}
                      disabled={level.locked}
                      onClick={() => startLevel(level)}
                    >
                      {level.locked 
                        ? `Niveau ${level.prerequisites.join(' & ')} requis` 
                        : level.completed 
                          ? 'Rejouer le niveau' 
                          : 'Démarrer le niveau'}
                      
                      {!level.locked && (
                        <ArrowRight className="ml-2 h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Section explicative */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 mb-12">
            <h3 className="text-2xl font-bold text-[#006a9e] mb-6">Comment fonctionne le CENTRE DE CRISE ÉVOLUTIF</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <div className="w-12 h-12 bg-[#006a9e] rounded-lg mb-4 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">Progression par niveau</h4>
                <p className="text-gray-600">
                  Commencez par des défis simples avec un seul interlocuteur expert, puis débloquez des situations plus complexes et de nouveaux experts en réussissant chaque niveau.
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="w-12 h-12 bg-[#006a9e] rounded-lg mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">Interlocuteurs experts</h4>
                <p className="text-gray-600">
                  Interagissez avec une équipe virtuelle d'experts en cybersécurité. Chaque niveau débloque un nouvel interlocuteur avec ses compétences spécifiques.
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="w-12 h-12 bg-[#006a9e] rounded-lg mb-4 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">Incidents réalistes</h4>
                <p className="text-gray-600">
                  Affrontez des incidents de cybersécurité basés sur des cas réels, de l'alerte phishing de base jusqu'à la gestion de crise majeure avec tous les interlocuteurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}