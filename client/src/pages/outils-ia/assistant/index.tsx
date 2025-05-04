import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useLocation } from 'wouter';
import { Plus, Settings, Search, Filter, Grid3X3, ListFilter, SlidersHorizontal, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/layout/PageTitle';
import { v4 as uuidv4 } from 'uuid';

// Types
interface AssistantTemplate {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  personality: string;
  domain: string;
  expertise: string[];
  avatarStyle: string;
  avatarColor: string;
  gamificationLevel: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomAssistant {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  personality: string;
  domain: string;
  expertise: string[];
  avatarStyle: string;
  avatarColor: string;
  gamificationLevel: string;
  isPublic: boolean;
  isVerified: boolean;
  userId: number;
  usageCount: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

// Composant pour un template d'assistant
const AssistantTemplateCard = ({ template }: { template: AssistantTemplate }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  const getAvatarColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      violet: isFuturistic ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-800',
      blue: isFuturistic ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800',
      green: isFuturistic ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800',
      yellow: isFuturistic ? 'bg-yellow-700 text-white' : 'bg-yellow-100 text-yellow-800',
      red: isFuturistic ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800',
      orange: isFuturistic ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-800',
      pink: isFuturistic ? 'bg-pink-700 text-white' : 'bg-pink-100 text-pink-800',
      gray: isFuturistic ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[color] || colorMap.violet;
  };
  
  const getAvatarIcon = (style: string) => {
    switch (style) {
      case 'robot':
        return '🤖';
      case 'cyborg':
        return '🦾';
      case 'scientist':
        return '🧪';
      case 'teacher':
        return '👩‍🏫';
      case 'professional':
        return '👨‍💼';
      default:
        return '🧠';
    }
  };
  
  const getDomainLabel = (domain: string) => {
    const domainMap: Record<string, string> = {
      cybersecurite: 'Cybersécurité',
      gestion_projet: 'Gestion de projet',
      amoa: 'AMOA',
      developpement: 'Développement',
      data_ia: 'Data & IA',
      conseil: 'Conseil',
      general: 'Général',
    };
    
    return domainMap[domain] || 'Général';
  };
  
  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md ${
      isFuturistic ? 'bg-gray-800 border-gray-700 hover:border-violet-500/40' : 'hover:border-violet-200'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
            getAvatarColorClass(template.avatarColor)
          }`}>
            {getAvatarIcon(template.avatarStyle)}
          </div>
          <div>
            <CardTitle className={`text-lg ${isFuturistic ? 'text-white' : ''}`}>
              {template.name}
            </CardTitle>
            <CardDescription className={isFuturistic ? 'text-gray-400' : ''}>
              {getDomainLabel(template.domain)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className={`text-sm mb-3 line-clamp-3 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {template.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {template.expertise.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant={isFuturistic ? "outline" : "secondary"}
              className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300' : ''}
                text-xs py-0 px-2
              `}
            >
              {tag}
            </Badge>
          ))}
          {template.expertise.length > 3 && (
            <Badge 
              variant={isFuturistic ? "outline" : "secondary"}
              className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300' : ''}
                text-xs py-0 px-2
              `}
            >
              +{template.expertise.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button
          asChild
          className={`w-full ${
            isFuturistic 
              ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
              : 'bg-violet-600 hover:bg-violet-700 text-white'
          }`}
        >
          <Link href={`/outils-ia/assistant/create?template=${template.id}`}>
            Utiliser ce modèle
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Composant pour un assistant personnalisé
const AssistantCard = ({ assistant }: { assistant: CustomAssistant }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  const getAvatarColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      violet: isFuturistic ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-800',
      blue: isFuturistic ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800',
      green: isFuturistic ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800',
      yellow: isFuturistic ? 'bg-yellow-700 text-white' : 'bg-yellow-100 text-yellow-800',
      red: isFuturistic ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800',
      orange: isFuturistic ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-800',
      pink: isFuturistic ? 'bg-pink-700 text-white' : 'bg-pink-100 text-pink-800',
      gray: isFuturistic ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[color] || colorMap.violet;
  };
  
  const getAvatarIcon = (style: string) => {
    switch (style) {
      case 'robot':
        return '🤖';
      case 'cyborg':
        return '🦾';
      case 'scientist':
        return '🧪';
      case 'teacher':
        return '👩‍🏫';
      case 'professional':
        return '👨‍💼';
      default:
        return '🧠';
    }
  };
  
  const getDomainLabel = (domain: string) => {
    const domainMap: Record<string, string> = {
      cybersecurite: 'Cybersécurité',
      gestion_projet: 'Gestion de projet',
      amoa: 'AMOA',
      developpement: 'Développement',
      data_ia: 'Data & IA',
      conseil: 'Conseil',
      general: 'Général',
    };
    
    return domainMap[domain] || 'Général';
  };
  
  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md ${
      isFuturistic ? 'bg-gray-800 border-gray-700 hover:border-violet-500/40' : 'hover:border-violet-200'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${
            getAvatarColorClass(assistant.avatarColor)
          }`}>
            {getAvatarIcon(assistant.avatarStyle)}
          </div>
          <div>
            <CardTitle className={`text-lg ${isFuturistic ? 'text-white' : ''}`}>
              {assistant.name}
            </CardTitle>
            <CardDescription className={isFuturistic ? 'text-gray-400' : ''}>
              {getDomainLabel(assistant.domain)}
              {assistant.isVerified && (
                <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-500 border-green-500/20">
                  Vérifié
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-2 flex-grow">
        <p className={`text-sm mb-3 line-clamp-3 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {assistant.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {assistant.expertise.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant={isFuturistic ? "outline" : "secondary"}
              className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300' : ''}
                text-xs py-0 px-2
              `}
            >
              {tag}
            </Badge>
          ))}
          {assistant.expertise.length > 3 && (
            <Badge 
              variant={isFuturistic ? "outline" : "secondary"}
              className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300' : ''}
                text-xs py-0 px-2
              `}
            >
              +{assistant.expertise.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 flex gap-2">
        <Button
          asChild
          variant="outline"
          className={`flex-1 ${
            isFuturistic 
              ? 'border-violet-500/40 text-white hover:bg-gray-700' 
              : ''
          }`}
        >
          <Link href={`/outils-ia/assistant/edit/${assistant.id}`}>
            <Settings size={16} className="mr-1" />
            Modifier
          </Link>
        </Button>
        
        <Button
          asChild
          className={`flex-1 ${
            isFuturistic 
              ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
              : 'bg-violet-600 hover:bg-violet-700 text-white'
          }`}
        >
          <Link href={`/outils-ia/assistant/${assistant.id}`}>
            Converser
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Page principale des assistants
export default function CustomAssistantPage() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<'user' | 'templates' | 'popular'>('user');
  
  // ID utilisateur temporaire pour les tests
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('assistant_user_id');
    if (savedUserId) return savedUserId;
    const newUserId = uuidv4();
    localStorage.setItem('assistant_user_id', newUserId);
    return newUserId;
  });
  
  // Récupération des modèles d'assistants
  const { 
    data: templates, 
    isLoading: isLoadingTemplates,
    error: templatesError
  } = useQuery({
    queryKey: ['/api/assistants/templates'],
    queryFn: async () => {
      // Pour la démonstration, nous utilisons des données fictives
      const fakeTemplates: AssistantTemplate[] = [
        {
          id: 1,
          name: "Assistant Cybersécurité",
          description: "Spécialiste en cybersécurité pour vous aider à comprendre les menaces et à sécuriser vos systèmes.",
          systemPrompt: "Vous êtes un expert en cybersécurité. Votre objectif est d'aider l'utilisateur à comprendre les concepts de cybersécurité et à apprendre à se protéger en ligne.",
          personality: "expert",
          domain: "cybersecurite",
          expertise: ["Gestion des risques", "Sécurité réseau", "Cryptographie", "Protection des données"],
          avatarStyle: "robot",
          avatarColor: "red",
          gamificationLevel: "leger",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Coach AMOA",
          description: "Un assistant spécialisé en Assistance à Maîtrise d'Ouvrage pour vous accompagner dans vos projets.",
          systemPrompt: "Vous êtes un expert en AMOA. Votre rôle est de guider l'utilisateur dans la gestion de projets, la définition des besoins, et la mise en place des spécifications fonctionnelles.",
          personality: "professionnel",
          domain: "amoa",
          expertise: ["Cadrage de projet", "Cahier des charges", "Recette", "Spécifications"],
          avatarStyle: "professional",
          avatarColor: "blue",
          gamificationLevel: "modere",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          name: "Assistant Data & IA",
          description: "Expert en Data Science et Intelligence Artificielle pour vous aider à comprendre et utiliser ces technologies.",
          systemPrompt: "Vous êtes un expert en Data Science et Intelligence Artificielle. Votre objectif est d'aider l'utilisateur à comprendre les concepts de data science, machine learning et IA.",
          personality: "pédagogique",
          domain: "data_ia",
          expertise: ["Machine Learning", "Deep Learning", "NLP", "Python", "Statistiques"],
          avatarStyle: "scientist",
          avatarColor: "violet",
          gamificationLevel: "eleve",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          name: "Mentor Développement",
          description: "Un guide pour vous aider à améliorer vos compétences en développement logiciel et bonnes pratiques.",
          systemPrompt: "Vous êtes un mentor en développement logiciel. Votre objectif est d'aider l'utilisateur à améliorer ses compétences en programmation et à adopter les meilleures pratiques de développement.",
          personality: "mentor",
          domain: "developpement",
          expertise: ["Architecture", "Clean Code", "Tests", "CI/CD", "DevOps"],
          avatarStyle: "teacher",
          avatarColor: "green",
          gamificationLevel: "modere",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          name: "Coach Gestion de Projet",
          description: "Un assistant spécialisé en gestion de projet pour vous aider à organiser et suivre vos projets efficacement.",
          systemPrompt: "Vous êtes un expert en gestion de projet. Votre rôle est d'aider l'utilisateur à planifier, organiser et suivre ses projets de manière efficace.",
          personality: "direct",
          domain: "gestion_projet",
          expertise: ["Méthodologies agiles", "Planification", "Gestion des risques", "Gestion d'équipe"],
          avatarStyle: "professional",
          avatarColor: "orange",
          gamificationLevel: "leger",
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      try {
        // Essayons de récupérer les vrais modèles depuis l'API
        const response = await axios.get('/api/assistants/templates');
        if (response.data.success && response.data.templates?.length > 0) {
          return response.data.templates;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des modèles:', error);
      }
      
      return fakeTemplates;
    },
    staleTime: 60000 * 10, // 10 minutes
  });
  
  // Récupération des assistants populaires
  const { 
    data: popularAssistants, 
    isLoading: isLoadingPopularAssistants
  } = useQuery({
    queryKey: ['/api/assistants/popular'],
    queryFn: async () => {
      // Pour la démonstration, nous utilisons des données fictives
      const fakePopularAssistants: CustomAssistant[] = [
        {
          id: 101,
          name: "IA Cybersécurité Avancée",
          description: "Un assistant spécialisé en cybersécurité avec des fonctionnalités avancées pour la détection des menaces.",
          systemPrompt: "Vous êtes un assistant avancé en cybersécurité...",
          personality: "expert",
          domain: "cybersecurite",
          expertise: ["Zero Trust", "Threat Hunting", "EDR", "SOC"],
          avatarStyle: "robot",
          avatarColor: "red",
          gamificationLevel: "eleve",
          isPublic: true,
          isVerified: true,
          userId: 42,
          usageCount: 354,
          rating: 4.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 102,
          name: "Coach Agile & Scrum",
          description: "Assistant pour la mise en place et le suivi des méthodologies agiles dans vos projets.",
          systemPrompt: "Vous êtes un coach agile expérimenté...",
          personality: "mentor",
          domain: "gestion_projet",
          expertise: ["Scrum", "Kanban", "SAFe", "Agile@Scale"],
          avatarStyle: "professional",
          avatarColor: "green",
          gamificationLevel: "modere",
          isPublic: true,
          isVerified: true,
          userId: 53,
          usageCount: 298,
          rating: 4.7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 103,
          name: "Data Viz Expert",
          description: "Assistant spécialisé dans la visualisation de données et la création de dashboards.",
          systemPrompt: "Vous êtes un expert en visualisation de données...",
          personality: "pédagogique",
          domain: "data_ia",
          expertise: ["Power BI", "Tableau", "D3.js", "Storytelling"],
          avatarStyle: "scientist",
          avatarColor: "blue",
          gamificationLevel: "leger",
          isPublic: true,
          isVerified: false,
          userId: 29,
          usageCount: 187,
          rating: 4.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      try {
        // Essayons de récupérer les vrais assistants populaires depuis l'API
        const response = await axios.get('/api/assistants/popular');
        if (response.data.success && response.data.assistants?.length > 0) {
          return response.data.assistants;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des assistants populaires:', error);
      }
      
      return fakePopularAssistants;
    },
    staleTime: 60000 * 5, // 5 minutes
  });
  
  // Récupération des assistants de l'utilisateur
  const { 
    data: userAssistants, 
    isLoading: isLoadingUserAssistants,
    error: userAssistantsError
  } = useQuery({
    queryKey: ['/api/assistants/user', userId],
    queryFn: async () => {
      // Pour la démonstration, nous utilisons des données fictives
      const fakeUserAssistants: CustomAssistant[] = [
        {
          id: 201,
          name: "Mon Assistant Cybersécurité",
          description: "Version personnalisée de l'assistant de cybersécurité avec mes préférences.",
          systemPrompt: "Vous êtes mon assistant personnalisé en cybersécurité...",
          personality: "amical",
          domain: "cybersecurite",
          expertise: ["Audit", "Conformité", "RGPD", "Sensibilisation"],
          avatarStyle: "cyborg",
          avatarColor: "red",
          gamificationLevel: "modere",
          isPublic: false,
          isVerified: false,
          userId: 1,
          usageCount: 42,
          rating: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 202,
          name: "Assistant AMOA Personnalisé",
          description: "Mon assistant pour m'aider dans mes missions d'AMOA au quotidien.",
          systemPrompt: "Vous êtes mon assistant AMOA personnalisé...",
          personality: "direct",
          domain: "amoa",
          expertise: ["Expression de besoin", "UAT", "Ateliers", "Backlog"],
          avatarStyle: "professional",
          avatarColor: "blue",
          gamificationLevel: "leger",
          isPublic: false,
          isVerified: false,
          userId: 1,
          usageCount: 28,
          rating: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      try {
        // Essayons de récupérer les vrais assistants depuis l'API
        const response = await axios.get(`/api/assistants/user/${userId}`);
        if (response.data.success && response.data.assistants?.length > 0) {
          return response.data.assistants;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des assistants:', error);
      }
      
      return fakeUserAssistants;
    },
    staleTime: 60000 * 2, // 2 minutes
  });
  
  // Filtrer les assistants en fonction de la recherche
  const filterBySearch = (items: (AssistantTemplate | CustomAssistant)[]) => {
    if (!searchQuery) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expertise.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  // Filtrer les assistants par domaine
  const filterByDomain = (items: (AssistantTemplate | CustomAssistant)[]) => {
    if (!domainFilter) return items;
    
    return items.filter(item => item.domain === domainFilter);
  };
  
  // Appliquer tous les filtres
  const filteredTemplates = filterByDomain(filterBySearch(templates || []));
  const filteredUserAssistants = filterByDomain(filterBySearch(userAssistants || []));
  const filteredPopularAssistants = filterByDomain(filterBySearch(popularAssistants || []));
  
  return (
    <Layout>
      <PageTitle title="Assistants IA Personnalisés" />
      
      <div className="container mx-auto py-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
              Assistants IA Personnalisés
            </h1>
            <p className={`mt-1 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
              Créez et personnalisez vos assistants IA pour différents domaines
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              asChild
              className={`${
                isFuturistic 
                  ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              <Link href="/outils-ia/assistant/create">
                <Plus size={16} className="mr-2" />
                Créer un assistant
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className={`${
                isFuturistic 
                  ? 'border-violet-500/40 text-violet-300 hover:bg-violet-900/20' 
                  : 'border-violet-200 text-violet-700 hover:bg-violet-50'
              }`}
            >
              <Link href="/outils-ia/admin">
                <Settings size={16} className="mr-2" />
                Administration
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Barre de filtres */}
        <div className={`p-4 mb-6 rounded-lg border ${
          isFuturistic ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-grow">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                isFuturistic ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <Input
                placeholder="Rechercher un assistant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 ${
                  isFuturistic 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                    : 'bg-white border-gray-200'
                }`}
              />
            </div>
            
            {/* Filtre par domaine */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`gap-2 ${
                      isFuturistic ? 'bg-gray-700 border-gray-600 text-gray-200' : ''
                    }`}
                  >
                    <Filter size={16} />
                    <span>{domainFilter ? getDomainLabel(domainFilter) : 'Tous les domaines'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  <DropdownMenuItem onClick={() => setDomainFilter(null)}>
                    Tous les domaines
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('cybersecurite')}>
                    Cybersécurité
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('gestion_projet')}>
                    Gestion de projet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('amoa')}>
                    AMOA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('developpement')}>
                    Développement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('data_ia')}>
                    Data & IA
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDomainFilter('conseil')}>
                    Conseil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Affichage grille/liste */}
            <div>
              <div className={`flex items-center gap-1 p-1 rounded-md ${
                isFuturistic ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDisplayMode('grid')}
                  className={`rounded-md ${
                    displayMode === 'grid' 
                      ? isFuturistic 
                        ? 'bg-violet-800/70 text-white' 
                        : 'bg-violet-100 text-violet-700'
                      : isFuturistic
                        ? 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                        : ''
                  }`}
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDisplayMode('list')}
                  className={`rounded-md ${
                    displayMode === 'list' 
                      ? isFuturistic 
                        ? 'bg-violet-800/70 text-white' 
                        : 'bg-violet-100 text-violet-700'
                      : isFuturistic
                        ? 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                        : ''
                  }`}
                >
                  <ListFilter size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation entre les sections */}
        <div className="mb-8">
          <div className={`flex border-b ${isFuturistic ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setSelectedSection('user')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedSection === 'user'
                  ? isFuturistic 
                    ? 'text-violet-400 border-b-2 border-violet-500' 
                    : 'text-violet-700 border-b-2 border-violet-600'
                  : isFuturistic
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes assistants
            </button>
            <button
              onClick={() => setSelectedSection('templates')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedSection === 'templates'
                  ? isFuturistic 
                    ? 'text-violet-400 border-b-2 border-violet-500' 
                    : 'text-violet-700 border-b-2 border-violet-600'
                  : isFuturistic
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Modèles
            </button>
            <button
              onClick={() => setSelectedSection('popular')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedSection === 'popular'
                  ? isFuturistic 
                    ? 'text-violet-400 border-b-2 border-violet-500' 
                    : 'text-violet-700 border-b-2 border-violet-600'
                  : isFuturistic
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Populaires
            </button>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div>
          {/* Mes assistants */}
          {selectedSection === 'user' && (
            <div>
              {isLoadingUserAssistants ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredUserAssistants.length === 0 ? (
                <div className={`text-center py-16 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                  <BrainCircuit className={`mx-auto h-12 w-12 mb-4 ${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                    Aucun assistant trouvé
                  </h3>
                  {searchQuery || domainFilter ? (
                    <p className="max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche ou de créer un nouvel assistant.
                    </p>
                  ) : (
                    <div>
                      <p className="max-w-md mx-auto mb-6">
                        Vous n'avez pas encore créé d'assistant personnalisé. Commencez en créant votre premier assistant.
                      </p>
                      <Button 
                        asChild
                        className={`${
                          isFuturistic 
                            ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                      >
                        <Link href="/outils-ia/assistant/create">
                          <Plus size={16} className="mr-2" />
                          Créer mon premier assistant
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-${displayMode === 'grid' ? '2' : '1'} lg:grid-cols-${displayMode === 'grid' ? '3' : '1'} gap-6`}>
                  {filteredUserAssistants.map(assistant => (
                    <AssistantCard key={assistant.id} assistant={assistant} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Modèles d'assistants */}
          {selectedSection === 'templates' && (
            <div>
              {isLoadingTemplates ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className={`text-center py-16 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                  <BrainCircuit className={`mx-auto h-12 w-12 mb-4 ${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                    Aucun modèle trouvé
                  </h3>
                  <p className="max-w-md mx-auto">
                    Essayez de modifier vos critères de recherche ou contactez l'administrateur.
                  </p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-${displayMode === 'grid' ? '2' : '1'} lg:grid-cols-${displayMode === 'grid' ? '3' : '1'} gap-6`}>
                  {filteredTemplates.map(template => (
                    <AssistantTemplateCard key={template.id} template={template} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Assistants populaires */}
          {selectedSection === 'popular' && (
            <div>
              {isLoadingPopularAssistants ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredPopularAssistants.length === 0 ? (
                <div className={`text-center py-16 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                  <BrainCircuit className={`mx-auto h-12 w-12 mb-4 ${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-medium mb-2 ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                    Aucun assistant populaire trouvé
                  </h3>
                  <p className="max-w-md mx-auto">
                    Essayez de modifier vos critères de recherche ou revenez plus tard.
                  </p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-${displayMode === 'grid' ? '2' : '1'} lg:grid-cols-${displayMode === 'grid' ? '3' : '1'} gap-6`}>
                  {filteredPopularAssistants.map(assistant => (
                    <AssistantCard key={assistant.id} assistant={assistant} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}