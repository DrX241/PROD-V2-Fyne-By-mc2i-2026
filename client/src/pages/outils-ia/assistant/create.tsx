import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useLocation } from 'wouter';
import { useSearchParams } from '@/lib/useSearchParams';
import { ArrowLeft, Save, Sparkles, HelpCircle, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/layout/PageTitle';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// Types et schémas de validation
const assistantSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  systemPrompt: z.string().min(20, "Le prompt système doit contenir au moins 20 caractères"),
  personality: z.enum(["professionnel", "amical", "direct", "expert", "pédagogique", "mentor"]),
  domain: z.enum(["cybersecurite", "gestion_projet", "amoa", "developpement", "data_ia", "conseil", "general"]),
  expertise: z.array(z.string()).min(1, "Ajoutez au moins un domaine d'expertise"),
  avatarStyle: z.enum(["robot", "cyborg", "scientist", "teacher", "professional"]),
  avatarColor: z.enum(["violet", "blue", "green", "yellow", "red", "orange", "pink", "gray"]),
  gamificationLevel: z.enum(["aucun", "leger", "modere", "eleve", "intense"]),
  isPublic: z.boolean().default(false),
  userId: z.number()
});

type AssistantFormValues = z.infer<typeof assistantSchema>;

// Page de création d'assistant
export default function CreateAssistantPage() {
  const [location, setLocation] = useLocation();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('base');
  const [newExpertise, setNewExpertise] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  // ID utilisateur temporaire pour les tests
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('assistant_user_id');
    if (savedUserId) return savedUserId;
    const newUserId = uuidv4();
    localStorage.setItem('assistant_user_id', newUserId);
    return newUserId;
  });
  
  // Obtenir le template sélectionné
  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['/api/assistants/templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const response = await axios.get(`/api/assistants/templates/${templateId}`);
      return response.data.template;
    },
    enabled: !!templateId,
    staleTime: 60000 * 10,
  });
  
  // Configuration du formulaire
  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantSchema),
    defaultValues: {
      name: '',
      description: '',
      systemPrompt: '',
      personality: 'professionnel',
      domain: 'general',
      expertise: [],
      avatarStyle: 'robot',
      avatarColor: 'violet',
      gamificationLevel: 'leger',
      isPublic: false,
      userId: 0
    }
  });
  
  // Récupérer l'ID utilisateur réel
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`/api/assistants/user/${userId}`);
        if (response.data.success) {
          // S'il y a des assistants, nous pouvons récupérer l'ID utilisateur à partir du premier
          if (response.data.assistants && response.data.assistants.length > 0) {
            form.setValue('userId', response.data.assistants[0].userId);
          } else {
            // Sinon, tentons de récupérer l'utilisateur ou d'en créer un
            const userResponse = await axios.post('/api/user/get-or-create', { username: userId });
            if (userResponse.data.success) {
              form.setValue('userId', userResponse.data.userId);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
        // Utiliser un ID temporaire par défaut pour la démo
        form.setValue('userId', 1);
      }
    };
    
    fetchUserId();
  }, [userId, form]);
  
  // Appliquer le modèle lorsqu'il est chargé
  useEffect(() => {
    if (template) {
      form.reset({
        name: `${template.name} personnalisé`,
        description: template.description,
        systemPrompt: template.systemPrompt,
        personality: template.personality,
        domain: template.domain,
        expertise: template.expertise,
        avatarStyle: template.avatarStyle,
        avatarColor: template.avatarColor,
        gamificationLevel: template.gamificationLevel,
        isPublic: false,
        userId: form.getValues().userId || 1
      });
    }
  }, [template, form]);
  
  // Fonction pour ajouter une expertise
  const addExpertise = () => {
    if (newExpertise.trim() === '') return;
    
    const currentExpertise = form.getValues().expertise || [];
    if (!currentExpertise.includes(newExpertise.trim())) {
      form.setValue('expertise', [...currentExpertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };
  
  // Fonction pour supprimer une expertise
  const removeExpertise = (tag: string) => {
    const currentExpertise = form.getValues().expertise || [];
    form.setValue('expertise', currentExpertise.filter(t => t !== tag));
  };
  
  // Fonction pour soumettre le formulaire
  const onSubmit = async (values: AssistantFormValues) => {
    setLoading(true);
    
    try {
      const response = await axios.post('/api/assistants', values);
      
      if (response.data.success) {
        toast({
          title: 'Assistant créé',
          description: 'Votre assistant a été créé avec succès.',
          variant: 'default',
        });
        
        // Rediriger vers la page de l'assistant
        setLocation(`/outils-ia/assistant/${response.data.assistant.id}`);
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la création de l\'assistant.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'assistant:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de l\'assistant.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fonctions utilitaires pour les avatars
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
  
  // Prévisualisation de l'assistant
  const PreviewCard = () => {
    const values = form.getValues();
    
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
      <div className={`rounded-lg overflow-hidden h-full border ${
        isFuturistic 
          ? 'bg-gray-800/90 border-violet-500/30 backdrop-blur-sm shadow-lg'
          : 'bg-white border-gray-200'
      }`}>
        <div className="p-4 pb-2 border-b">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full text-xl ${getAvatarColorClass(values.avatarColor)}`}>
              {getAvatarIcon(values.avatarStyle)}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                {values.name || 'Nom de l\'assistant'}
              </h3>
              <p className={`text-xs ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>
                {getDomainLabel(values.domain)} • {getPersonalityLabel(values.personality)}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
          <p className="line-clamp-3">
            {values.description || 'Description de l\'assistant...'}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {values.expertise?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant={isFuturistic ? "outline" : "secondary"} className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''}
                text-xs py-0 px-2
              `}>
                {tag}
              </Badge>
            ))}
            {values.expertise && values.expertise.length > 3 && (
              <Badge variant={isFuturistic ? "outline" : "secondary"} className={`
                ${isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''}
                text-xs py-0 px-2
              `}>
                +{values.expertise.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="mt-4 text-xs">
            <div className={`flex items-center gap-1 ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
              <Sparkles className="h-3 w-3" />
              <span>Gamification: {getGamificationLabel(values.gamificationLevel)}</span>
            </div>
          </div>
          
          <div className={`mt-4 p-3 rounded-md text-xs ${
            isFuturistic 
              ? 'bg-gray-700/50 border border-violet-500/20'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className="font-semibold mb-1">Instructions système (extrait):</p>
            <p className="line-clamp-4 italic">
              {values.systemPrompt || 'Les instructions système définissent le comportement de l\'assistant...'}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu de la page
  return (
    <Layout>
      <PageTitle title="Créer un assistant IA" />
      
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/outils-ia/assistant" className="flex items-center text-violet-600 hover:text-violet-700 w-fit transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            <span>Retour aux assistants</span>
          </Link>
        </div>
        
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
            {templateId ? 'Personnaliser le modèle' : 'Créer un assistant IA'}
          </h1>
          <p className={`mt-1 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
            {templateId 
              ? 'Adaptez ce modèle à vos besoins spécifiques' 
              : 'Configurez votre assistant IA personnalisé'}
          </p>
        </div>
        
        {/* Formulaire de création */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={isFuturistic ? 'text-white' : ''}>Configuration de l'assistant</CardTitle>
                <CardDescription className={isFuturistic ? 'text-gray-300' : ''}>
                  Personnalisez les capacités et le comportement de votre assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className={`grid grid-cols-3 w-full mb-6 ${
                        isFuturistic ? 'bg-gray-700/50 border border-violet-500/20' : 'bg-gray-100'
                      }`}>
                        <TabsTrigger value="base" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700'}>
                          Informations de base
                        </TabsTrigger>
                        <TabsTrigger value="capacites" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700'}>
                          Capacités
                        </TabsTrigger>
                        <TabsTrigger value="personalisation" className={isFuturistic ? 'data-[state=active]:bg-violet-800/40 data-[state=active]:text-white text-gray-300' : 'data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700'}>
                          Personnalisation
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Onglet Informations de base */}
                      <TabsContent value="base" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>Nom</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nom de l'assistant" 
                                  {...field} 
                                  className={isFuturistic 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50'
                                    : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Décrivez brièvement les fonctionnalités et la spécialité de votre assistant..." 
                                  rows={3}
                                  {...field} 
                                  className={isFuturistic 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50'
                                    : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="domain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                  Domaine principal
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 ml-1 inline-block opacity-70" />
                                      </TooltipTrigger>
                                      <TooltipContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                                        Le domaine principal dans lequel votre assistant est spécialisé
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                                      <SelectValue placeholder="Sélectionnez un domaine" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white text-gray-800'}>
                                    <SelectItem value="cybersecurite">Cybersécurité</SelectItem>
                                    <SelectItem value="gestion_projet">Gestion de projet</SelectItem>
                                    <SelectItem value="amoa">AMOA</SelectItem>
                                    <SelectItem value="developpement">Développement</SelectItem>
                                    <SelectItem value="data_ia">Data & IA</SelectItem>
                                    <SelectItem value="conseil">Conseil</SelectItem>
                                    <SelectItem value="general">Général</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="personality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                  Personnalité
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 ml-1 inline-block opacity-70" />
                                      </TooltipTrigger>
                                      <TooltipContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                                        Le style de communication de votre assistant
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                                      <SelectValue placeholder="Sélectionnez une personnalité" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white text-gray-800'}>
                                    <SelectItem value="professionnel">Professionnel</SelectItem>
                                    <SelectItem value="amical">Amical</SelectItem>
                                    <SelectItem value="direct">Direct</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                    <SelectItem value="pédagogique">Pédagogique</SelectItem>
                                    <SelectItem value="mentor">Mentor</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="expertise"
                          render={() => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                Domaines d'expertise
                              </FormLabel>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {form.getValues().expertise?.map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant={isFuturistic ? "outline" : "secondary"}
                                    className={`
                                      ${isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''}
                                      flex items-center gap-1
                                    `}
                                  >
                                    {tag}
                                    <button 
                                      type="button" 
                                      onClick={() => removeExpertise(tag)}
                                      className="ml-1 rounded-full hover:bg-red-500/20 p-0.5"
                                    >
                                      <AlertCircle className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Ajouter un domaine d'expertise"
                                  value={newExpertise}
                                  onChange={(e) => setNewExpertise(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addExpertise();
                                    }
                                  }}
                                  className={isFuturistic 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50'
                                    : 'focus-visible:ring-blue-500/50 focus-visible:border-blue-500'
                                  }
                                />
                                <Button
                                  type="button"
                                  onClick={addExpertise}
                                  variant="outline"
                                  className={isFuturistic ? 'border-violet-500/40 text-white hover:bg-gray-700' : ''}
                                >
                                  Ajouter
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      {/* Onglet Capacités */}
                      <TabsContent value="capacites" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="systemPrompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                Instructions système
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 ml-1 inline-block opacity-70" />
                                    </TooltipTrigger>
                                    <TooltipContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                                      Les instructions détaillées qui définissent le comportement, les connaissances et les limites de votre assistant
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Vous êtes un assistant spécialisé dans..." 
                                  rows={10}
                                  {...field} 
                                  className={isFuturistic 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50 font-mono text-sm'
                                    : 'font-mono text-sm'
                                  }
                                />
                              </FormControl>
                              <FormDescription className={isFuturistic ? 'text-gray-400' : ''}>
                                Ces instructions sont invisibles pour l'utilisateur mais guident le comportement de l'assistant.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gamificationLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                Niveau de gamification
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 ml-1 inline-block opacity-70" />
                                    </TooltipTrigger>
                                    <TooltipContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
                                      Détermine à quel point votre assistant intègre des éléments ludiques dans ses interactions
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                                    <SelectValue placeholder="Sélectionnez un niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white text-gray-800'}>
                                  <SelectItem value="aucun">Aucun - Strictement professionnel</SelectItem>
                                  <SelectItem value="leger">Léger - Occasionnellement ludique</SelectItem>
                                  <SelectItem value="modere">Modéré - Régulièrement ludique</SelectItem>
                                  <SelectItem value="eleve">Élevé - Très ludique</SelectItem>
                                  <SelectItem value="intense">Intense - Complètement gamifié</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className={isFuturistic ? 'text-gray-400' : ''}>
                                Les niveaux plus élevés incluent des quiz, défis et récompenses virtuelles.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isPublic"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border bg-card">
                              <div className="space-y-0.5">
                                <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                  Rendre public
                                </FormLabel>
                                <FormDescription className={isFuturistic ? 'text-gray-400' : ''}>
                                  Permettre aux autres utilisateurs de découvrir et d'utiliser votre assistant
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className={isFuturistic ? 'data-[state=checked]:bg-violet-600' : 'data-[state=checked]:bg-blue-600'}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      {/* Onglet Personnalisation */}
                      <TabsContent value="personalisation" className="space-y-6">
                        <FormField
                          control={form.control}
                          name="avatarStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                Style d'avatar
                              </FormLabel>
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-3">
                                {['robot', 'cyborg', 'scientist', 'teacher', 'professional'].map((style) => (
                                  <div key={style} className="flex flex-col items-center">
                                    <button
                                      type="button"
                                      onClick={() => form.setValue('avatarStyle', style)}
                                      className={`
                                        w-16 h-16 rounded-full flex items-center justify-center text-2xl
                                        ${field.value === style ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                        ${isFuturistic ? 'ring-offset-gray-800' : ''}
                                        ${getAvatarColorClass(form.getValues().avatarColor || 'violet')}
                                      `}
                                    >
                                      {getAvatarIcon(style)}
                                    </button>
                                    <span className={`mt-2 text-xs ${isFuturistic ? 'text-gray-300' : ''}`}>
                                      {style.charAt(0).toUpperCase() + style.slice(1)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="avatarColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={isFuturistic ? 'text-white' : ''}>
                                Couleur d'avatar
                              </FormLabel>
                              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 py-3">
                                {['violet', 'blue', 'green', 'yellow', 'red', 'orange', 'pink', 'gray'].map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => form.setValue('avatarColor', color)}
                                    className={`
                                      w-10 h-10 rounded-full
                                      ${field.value === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                      ${isFuturistic ? 'ring-offset-gray-800' : ''}
                                      ${getAvatarColorClass(color || 'violet')}
                                    `}
                                  >
                                    {field.value === color && <Check className="h-5 w-5" />}
                                  </button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/outils-ia/assistant')}
                        className={isFuturistic ? 'border-violet-500/40 text-white hover:bg-gray-700' : 'border-blue-500/40 text-gray-800 hover:bg-blue-50'}
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit"
                        disabled={loading}
                        className={`${
                          isFuturistic 
                            ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Création en cours...' : 'Créer l\'assistant'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Prévisualisation */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
              Prévisualisation
            </h3>
            <div className="sticky top-24">
              <PreviewCard />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}