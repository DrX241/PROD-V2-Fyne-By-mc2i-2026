import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Plus, Search, Zap, Star, Book, Trophy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  category: string;
  personality: string;
  domain: string;
  expertise: string[];
  avatarStyle: string;
  avatarColor: string;
  gamificationLevel: string;
  isOfficial: boolean;
}

interface CustomAssistant {
  id: number;
  name: string;
  description: string;
  personality: string;
  domain: string;
  expertise: string[];
  avatarStyle: string;
  avatarColor: string;
  gamificationLevel: string;
  isPublic: boolean;
  isVerified: boolean;
  usageCount: number;
  rating: number;
  updatedAt: string;
}

// Composant pour afficher un assistant
const AssistantCard: React.FC<{
  assistant: AssistantTemplate | CustomAssistant;
  isTemplate?: boolean;
  onUseTemplate?: (template: AssistantTemplate) => void;
  onSelect?: (assistant: CustomAssistant) => void;
  onEdit?: (assistant: CustomAssistant) => void;
  onDelete?: (id: number) => void;
}> = ({ assistant, isTemplate = false, onUseTemplate, onSelect, onEdit, onDelete }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  // Fonction pour générer une couleur de fond basée sur l'attribut avatarColor
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
  
  // Fonction pour obtenir l'icône d'avatar en fonction du style
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
  
  // Personnalité en français
  const getPersonalityLabel = (personality: string) => {
    const personalityMap: Record<string, string> = {
      professionnel: 'Professionnel',
      amical: 'Amical',
      direct: 'Direct',
      expert: 'Expert',
      pédagogique: 'Pédagogique',
      mentor: 'Mentor',
    };
    
    return personalityMap[personality] || 'Professionnel';
  };
  
  // Domaine en français
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
  
  // Niveau de gamification en français
  const getGamificationLabel = (level: string) => {
    const levelMap: Record<string, string> = {
      aucun: 'Aucun',
      leger: 'Léger',
      modere: 'Modéré',
      eleve: 'Élevé',
      intense: 'Intense',
    };
    
    return levelMap[level] || 'Léger';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden h-full ${
        isFuturistic
          ? 'bg-gray-800/90 border-violet-500/30 backdrop-blur-sm shadow-lg hover:shadow-violet-500/10'
          : 'bg-white border-gray-200 hover:border-violet-200 hover:shadow-md'
      } transition-all duration-300`}>
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg ${getAvatarColorClass(assistant.avatarColor)}`}>
                {getAvatarIcon(assistant.avatarStyle)}
              </div>
              <div>
                <CardTitle className={`text-lg ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                  {assistant.name}
                </CardTitle>
                <CardDescription className={`text-xs ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>
                  {getDomainLabel(assistant.domain)} • {getPersonalityLabel(assistant.personality)}
                </CardDescription>
              </div>
            </div>
            
            {!isTemplate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={isFuturistic ? 'text-gray-300 hover:text-white hover:bg-gray-700' : ''}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                  <DropdownMenuItem onClick={() => onSelect && onSelect(assistant as CustomAssistant)}>
                    Démarrer une conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit && onEdit(assistant as CustomAssistant)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={() => onDelete && onDelete(assistant.id)}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={`p-4 pt-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'} text-sm flex-grow`}>
          <p className="line-clamp-3">{assistant.description}</p>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {assistant.expertise.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant={isFuturistic ? "outline" : "secondary"} className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''}
                text-xs py-0 px-2
              `}>
                {tag}
              </Badge>
            ))}
            {assistant.expertise.length > 3 && (
              <Badge variant={isFuturistic ? "outline" : "secondary"} className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''}
                text-xs py-0 px-2
              `}>
                +{assistant.expertise.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className={`flex items-center gap-1 ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
              <Zap className="h-3 w-3" />
              <span>Gamification: {getGamificationLabel(assistant.gamificationLevel)}</span>
            </div>
            
            {!isTemplate && 'rating' in assistant && (
              <div className={`flex items-center gap-1 ${isFuturistic ? 'text-amber-400' : 'text-amber-500'}`}>
                <Star className="h-3 w-3 fill-current" />
                <span>{assistant.rating > 0 ? assistant.rating : '-'}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className={`p-4 pt-0 ${isFuturistic ? 'border-t border-gray-700/50' : 'border-t'} mt-auto`}>
          {isTemplate ? (
            <Button 
              onClick={() => onUseTemplate && onUseTemplate(assistant as AssistantTemplate)}
              className={`w-full ${
                isFuturistic 
                ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
              size="sm"
            >
              Utiliser ce modèle
            </Button>
          ) : (
            <Button 
              onClick={() => onSelect && onSelect(assistant as CustomAssistant)}
              className={`w-full ${
                isFuturistic 
                ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
              size="sm"
            >
              Démarrer une conversation
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Page principale des assistants personnalisés
export default function CustomAssistantPage() {
  const [location, setLocation] = useLocation();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('mes-assistants');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ID utilisateur temporaire pour les tests
  // À terme, à remplacer par l'ID de l'utilisateur connecté
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('assistant_user_id');
    if (savedUserId) return savedUserId;
    const newUserId = uuidv4();
    localStorage.setItem('assistant_user_id', newUserId);
    return newUserId;
  });
  
  // Requêtes pour récupérer les assistants personnalisés et les modèles
  const { 
    data: userAssistants,
    isLoading: isLoadingUserAssistants,
    refetch: refetchUserAssistants 
  } = useQuery({
    queryKey: ['/api/assistants/user', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/assistants/user/${userId}`);
      return response.data.assistants || [];
    },
    staleTime: 60000, // 1 minute
  });
  
  const { 
    data: templates,
    isLoading: isLoadingTemplates 
  } = useQuery({
    queryKey: ['/api/assistants/templates'],
    queryFn: async () => {
      const response = await axios.get('/api/assistants/templates');
      return response.data.templates || [];
    },
    staleTime: 60000 * 10, // 10 minutes
  });
  
  const { 
    data: popularAssistants,
    isLoading: isLoadingPopular 
  } = useQuery({
    queryKey: ['/api/assistants/popular'],
    queryFn: async () => {
      const response = await axios.get('/api/assistants/popular');
      return response.data.assistants || [];
    },
    staleTime: 60000 * 5, // 5 minutes
  });
  
  // Filtrer les assistants en fonction de la recherche
  const filteredAssistants = userAssistants?.filter(assistant => 
    assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.expertise.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  const filteredTemplates = templates?.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.expertise.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Fonctions de gestion des assistants
  const handleUseTemplate = (template: AssistantTemplate) => {
    setLocation(`/outils-ia/assistant/create?template=${template.id}`);
  };
  
  const handleSelectAssistant = (assistant: CustomAssistant) => {
    setLocation(`/outils-ia/assistant/${assistant.id}`);
  };
  
  const handleEditAssistant = (assistant: CustomAssistant) => {
    setLocation(`/outils-ia/assistant/edit/${assistant.id}`);
  };
  
  const handleDeleteAssistant = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet assistant ?')) {
      try {
        await axios.delete(`/api/assistants/${id}`);
        toast({
          title: 'Assistant supprimé',
          description: 'L\'assistant a été supprimé avec succès.',
          variant: 'default',
        });
        refetchUserAssistants();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'assistant. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <Layout>
      <PageTitle title="Assistants IA Personnalisés" />
      
      {/* En-tête avec navigation */}
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/outils-ia" className="flex items-center text-violet-600 hover:text-violet-700 w-fit transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            <span>Retour aux outils IA</span>
          </Link>
        </div>
        
        {/* En-tête avec titre et bouton de création */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
              Assistants IA Personnalisés
            </h1>
            <p className={`mt-1 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
              Créez, personnalisez et gérez vos assistants IA sur mesure
            </p>
          </div>
          
          <Button 
            onClick={() => setLocation('/outils-ia/assistant/create')}
            className={`${
              isFuturistic 
                ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
            }`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer un assistant
          </Button>
        </div>
        
        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`} />
            <Input
              placeholder="Rechercher un assistant ou un modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${
                isFuturistic 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50'
                  : 'bg-white border-gray-200 focus-visible:ring-violet-500/30'
              }`}
            />
          </div>
        </div>
        
        {/* Onglets */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className={`grid grid-cols-3 w-full mb-6 ${
            isFuturistic 
              ? 'bg-gray-800/90 border border-violet-500/20'
              : 'bg-gray-100'
          }`}>
            <TabsTrigger value="mes-assistants" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : ''}>
              Mes Assistants
            </TabsTrigger>
            <TabsTrigger value="modeles" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : ''}>
              Modèles
            </TabsTrigger>
            <TabsTrigger value="populaires" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : ''}>
              Populaires
            </TabsTrigger>
          </TabsList>
          
          {/* Contenu des onglets */}
          <TabsContent value="mes-assistants">
            {isLoadingUserAssistants ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, i) => (
                  <Card key={i} className={`${isFuturistic ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className={`h-10 w-10 rounded-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className="space-y-2">
                          <Skeleton className={`h-4 w-40 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                          <Skeleton className={`h-3 w-24 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className={`h-9 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredAssistants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssistants.map((assistant) => (
                  <AssistantCard
                    key={assistant.id}
                    assistant={assistant}
                    onSelect={handleSelectAssistant}
                    onEdit={handleEditAssistant}
                    onDelete={handleDeleteAssistant}
                  />
                ))}
              </div>
            ) : searchQuery ? (
              <div className={`text-center py-12 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun assistant trouvé</h3>
                <p>Aucun assistant ne correspond à votre recherche. Essayez avec d'autres termes ou créez-en un nouveau.</p>
              </div>
            ) : (
              <div className={`text-center py-12 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Vous n'avez pas encore d'assistant</h3>
                <p className="mb-6">Créez votre premier assistant personnalisé ou utilisez un modèle pour démarrer.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setLocation('/outils-ia/assistant/create')}
                    className={`${
                      isFuturistic 
                        ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un assistant
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('modeles')}
                    className={isFuturistic ? 'border-violet-500/40 text-white hover:bg-gray-800' : ''}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    Parcourir les modèles
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="modeles">
            {isLoadingTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <Card key={i} className={`${isFuturistic ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className={`h-10 w-10 rounded-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className="space-y-2">
                          <Skeleton className={`h-4 w-40 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                          <Skeleton className={`h-3 w-24 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className={`h-9 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <AssistantCard
                    key={template.id}
                    assistant={template}
                    isTemplate={true}
                    onUseTemplate={handleUseTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                <Book className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun modèle trouvé</h3>
                <p>Aucun modèle ne correspond à votre recherche. Essayez avec d'autres termes.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="populaires">
            {isLoadingPopular ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, i) => (
                  <Card key={i} className={`${isFuturistic ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className={`h-10 w-10 rounded-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        <div className="space-y-2">
                          <Skeleton className={`h-4 w-40 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                          <Skeleton className={`h-3 w-24 ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <Skeleton className={`h-4 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className={`h-9 w-full ${isFuturistic ? 'bg-gray-700' : 'bg-gray-200'}`} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : popularAssistants?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularAssistants.map((assistant) => (
                  <AssistantCard
                    key={assistant.id}
                    assistant={assistant}
                    onSelect={handleSelectAssistant}
                  />
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun assistant populaire pour le moment</h3>
                <p>Créez et partagez vos assistants pour qu'ils apparaissent ici!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}