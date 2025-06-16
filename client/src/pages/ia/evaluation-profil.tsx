import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Brain, 
  User, 
  Briefcase, 
  Target, 
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
  Clock,
  Building,
  BookOpen
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de validation simplifié et focalisé
const profileEvaluationSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  company: z.string().min(2, "Le nom de l'entreprise est requis"),
  activityDomain: z.string().min(1, "Veuillez sélectionner votre domaine d'activité"),
  currentRole: z.string().min(2, "Votre rôle actuel est requis"),
  aiGenerativeLevel: z.string().min(1, "Veuillez sélectionner votre niveau en IA générative"),
  learningObjectives: z.array(z.string()).min(1, "Sélectionnez au moins un objectif d'apprentissage"),
  specificNeeds: z.string().min(10, "Décrivez vos besoins spécifiques (minimum 10 caractères)"),
  timeAvailable: z.string().min(1, "Veuillez indiquer votre disponibilité"),
  learningStyle: z.string().min(1, "Veuillez sélectionner votre style d'apprentissage préféré")
});

type ProfileEvaluationForm = z.infer<typeof profileEvaluationSchema>;

const ProfileEvaluation = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [personalizedProgram, setPersonalizedProgram] = useState<any>(null);

  const form = useForm<ProfileEvaluationForm>({
    resolver: zodResolver(profileEvaluationSchema),
    defaultValues: {
      firstName: '',
      company: '',
      activityDomain: '',
      currentRole: '',
      aiGenerativeLevel: '',
      learningObjectives: [],
      specificNeeds: '',
      timeAvailable: '',
      learningStyle: ''
    }
  });

  const steps = [
    { title: "Votre profil", icon: <User className="w-5 h-5" /> },
    { title: "Niveau IA Générative", icon: <Brain className="w-5 h-5" /> },
    { title: "Objectifs d'apprentissage", icon: <Target className="w-5 h-5" /> },
    { title: "Programme personnalisé", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const activityDomains = [
    "Finance & Banque",
    "Santé & Pharmaceutique", 
    "Industrie & Manufacturing",
    "Commerce & Retail",
    "Technologie & IT",
    "Éducation & Formation",
    "Marketing & Communication",
    "Ressources Humaines",
    "Juridique & Compliance",
    "Consulting & Services",
    "Transport & Logistique",
    "Énergie & Environnement",
    "Immobilier & Construction",
    "Agriculture & Agroalimentaire",
    "Médias & Divertissement",
    "Secteur Public",
    "Autre"
  ];

  const aiGenerativeLevels = [
    { 
      value: "debutant", 
      label: "Débutant", 
      description: "Je découvre l'IA générative (ChatGPT, Claude, etc.)" 
    },
    { 
      value: "utilisateur", 
      label: "Utilisateur occasionnel", 
      description: "J'utilise parfois des outils IA pour des tâches simples" 
    },
    { 
      value: "regulier", 
      label: "Utilisateur régulier", 
      description: "J'utilise régulièrement l'IA générative dans mon travail" 
    },
    { 
      value: "avance", 
      label: "Utilisateur avancé", 
      description: "Je maîtrise le prompt engineering et l'usage stratégique" 
    },
    { 
      value: "expert", 
      label: "Expert", 
      description: "Je développe ou déploie des solutions IA générative" 
    }
  ];

  const learningObjectivesOptions = [
    "Maîtriser l'art du prompt engineering",
    "Intégrer l'IA générative dans mes processus métier",
    "Automatiser des tâches répétitives avec l'IA",
    "Créer du contenu (texte, images, vidéos) avec l'IA",
    "Développer des chatbots et assistants IA",
    "Analyser et traiter des données avec l'IA",
    "Former mes équipes à l'IA générative",
    "Développer une stratégie IA pour mon entreprise",
    "Créer des applications basées sur l'IA générative",
    "Comprendre les enjeux éthiques et juridiques de l'IA"
  ];

  const timeAvailableOptions = [
    { value: "1-2h", label: "1-2 heures par semaine" },
    { value: "3-5h", label: "3-5 heures par semaine" },
    { value: "6-10h", label: "6-10 heures par semaine" },
    { value: "10h+", label: "Plus de 10 heures par semaine" }
  ];

  const learningStyles = [
    { 
      value: "pratique", 
      label: "Apprentissage pratique", 
      description: "Apprendre en faisant, avec des exercices concrets" 
    },
    { 
      value: "theorique", 
      label: "Apprentissage théorique", 
      description: "Comprendre d'abord les concepts avant la pratique" 
    },
    { 
      value: "mixte", 
      label: "Approche mixte", 
      description: "Combiner théorie et pratique de façon équilibrée" 
    },
    { 
      value: "cas-usage", 
      label: "Cas d'usage sectoriels", 
      description: "Apprendre via des exemples de votre domaine d'activité" 
    }
  ];

  // Mutation pour envoyer les données au backend
  const generateProgramMutation = useMutation({
    mutationFn: async (data: ProfileEvaluationForm) => {
      return await apiRequest('/api/ia/generate-personalized-program', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      setPersonalizedProgram(data);
      setCurrentStep(3);
      toast({
        title: "Programme généré",
        description: `Programme personnalisé créé pour ${form.getValues('firstName')}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer votre programme personnalisé. Veuillez réessayer.",
      });
    }
  });

  const onSubmit = (data: ProfileEvaluationForm) => {
    generateProgramMutation.mutate(data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-12 h-12 text-blue-400 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Créons votre programme IA personnalisé
              </h1>
              <p className="text-lg text-blue-200">
                Une formation adaptée à votre profil et vos objectifs professionnels
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    index <= currentStep ? 'text-blue-300' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep < 3 ? (
            <Card className="bg-blue-800/50 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  {steps[currentStep].title}
                </CardTitle>
                <CardDescription className="text-blue-200">
                  {currentStep === 0 && "Parlez-nous de vous et de votre contexte professionnel"}
                  {currentStep === 1 && "Évaluez votre niveau actuel en IA générative"}
                  {currentStep === 2 && "Définissez vos objectifs d'apprentissage spécifiques"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Étape 0: Profil personnel */}
                    {currentStep === 0 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Prénom</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Votre prénom"
                                  className="bg-blue-900 border-blue-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Entreprise</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Nom de votre entreprise"
                                  className="bg-blue-900 border-blue-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="activityDomain"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Domaine d'activité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez votre secteur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  {activityDomains.map((domain) => (
                                    <SelectItem key={domain} value={domain}>
                                      {domain}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="currentRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Poste actuel</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ex: Directeur Marketing, Consultant, Développeur..."
                                  className="bg-blue-900 border-blue-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Étape 1: Niveau IA générative */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="aiGenerativeLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white text-lg">
                                Quel est votre niveau actuel en IA générative ?
                              </FormLabel>
                              <FormDescription className="text-blue-200">
                                Soyez honnête, cela nous aide à adapter le contenu à votre niveau
                              </FormDescription>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-4"
                                >
                                  {aiGenerativeLevels.map((level) => (
                                    <div key={level.value} className="p-4 border border-blue-600 rounded-lg hover:bg-blue-700/30">
                                      <div className="flex items-center space-x-3">
                                        <RadioGroupItem value={level.value} id={level.value} />
                                        <div className="flex-1">
                                          <label
                                            htmlFor={level.value}
                                            className="text-blue-100 font-medium cursor-pointer block"
                                          >
                                            {level.label}
                                          </label>
                                          <p className="text-blue-300 text-sm mt-1">
                                            {level.description}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Étape 2: Objectifs */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="learningObjectives"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-white text-lg">
                                Que souhaitez-vous apprendre ? (sélectionnez plusieurs options)
                              </FormLabel>
                              <FormDescription className="text-blue-200">
                                Choisissez les compétences que vous voulez développer en priorité
                              </FormDescription>
                              <div className="grid grid-cols-1 gap-3">
                                {learningObjectivesOptions.map((objective) => (
                                  <FormField
                                    key={objective}
                                    control={form.control}
                                    name="learningObjectives"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-blue-600 rounded-lg hover:bg-blue-700/30">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(objective)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...(field.value || []), objective]
                                                : field.value?.filter((value) => value !== objective) || [];
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-blue-200 font-normal cursor-pointer flex-1">
                                          {objective}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="specificNeeds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Besoins spécifiques</FormLabel>
                              <FormDescription className="text-blue-200">
                                Décrivez votre contexte, vos défis actuels, ce que vous aimeriez accomplir...
                              </FormDescription>
                              <FormControl>
                                <Textarea
                                  placeholder="Ex: Je souhaite automatiser la création de contenus marketing pour mon équipe, améliorer nos processus de recrutement avec l'IA..."
                                  className="min-h-[120px] bg-blue-900 border-blue-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="timeAvailable"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Temps disponible</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                      <SelectValue placeholder="Choisissez votre disponibilité" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                    {timeAvailableOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="learningStyle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Style d'apprentissage</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                      <SelectValue placeholder="Comment préférez-vous apprendre ?" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                    {learningStyles.map((style) => (
                                      <SelectItem key={style.value} value={style.value}>
                                        {style.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="border-blue-600 text-blue-100 hover:bg-blue-700"
                      >
                        Précédent
                      </Button>
                      
                      {currentStep < 2 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Suivant
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={generateProgramMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {generateProgramMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Créer mon programme IA
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            // Affichage du programme personnalisé
            personalizedProgram && (
              <div className="space-y-6">
                <Card className="bg-green-800/50 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                      Votre Programme IA Personnalisé
                    </CardTitle>
                    <CardDescription className="text-green-200">
                      Programme créé spécialement pour {personalizedProgram.userProfile?.firstName} de {personalizedProgram.userProfile?.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Parcours recommandé</h3>
                          <p className="text-blue-200">{personalizedProgram.recommendedPath}</p>
                        </div>
                        
                        <div className="p-4 bg-purple-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Durée estimée</h3>
                          <div className="flex items-center text-purple-200">
                            <Clock className="w-4 h-4 mr-2" />
                            {personalizedProgram.estimatedDuration}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Modules personnalisés</h3>
                          <div className="text-orange-200 text-sm">
                            {personalizedProgram.customModules?.length || 0} modules adaptés à votre profil
                          </div>
                        </div>
                        
                        <div className="p-4 bg-pink-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Cas d'usage sectoriels</h3>
                          <div className="text-pink-200 text-sm">
                            Exemples spécifiques au secteur {personalizedProgram.userProfile?.activityDomain}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {personalizedProgram.modules && personalizedProgram.modules.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-blue-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Modules de votre programme</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {personalizedProgram.modules.map((module: any, index: number) => (
                            <div key={index} className="p-4 bg-blue-600/30 rounded-lg border border-blue-500">
                              <h4 className="font-medium text-white mb-2">{module.title}</h4>
                              <p className="text-blue-200 text-sm mb-2">{module.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-blue-300 border-blue-500">
                                  {module.duration}
                                </Badge>
                                <span className="text-blue-300 text-xs">{module.difficulty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-blue-700">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setLocation('/ia/training/' + personalizedProgram.programId)}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Commencer ma formation
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-blue-500 text-blue-300 hover:bg-blue-600"
                          onClick={() => {
                            setCurrentStep(0);
                            setPersonalizedProgram(null);
                            form.reset();
                          }}
                        >
                          Créer un nouveau programme
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </div>
      </div>
    </HomeLayout>
  );
};

export default ProfileEvaluation;