import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Brain, 
  User, 
  Briefcase, 
  Target, 
  Code, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de validation pour l'évaluation de profil
const profileEvaluationSchema = z.object({
  // Informations personnelles
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  currentRole: z.string().min(2, "Le rôle actuel est requis"),
  experience: z.string().min(1, "L'expérience est requise"),
  company: z.string().optional(),
  
  // Niveau actuel en IA
  aiExperience: z.string().min(1, "Veuillez sélectionner votre niveau"),
  programmingLevel: z.string().min(1, "Veuillez sélectionner votre niveau"),
  mathLevel: z.string().min(1, "Veuillez sélectionner votre niveau"),
  
  // Objectifs
  learningGoals: z.array(z.string()).min(1, "Sélectionnez au moins un objectif"),
  timeAvailable: z.string().min(1, "Veuillez indiquer votre disponibilité"),
  
  // Préférences d'apprentissage
  learningStyle: z.string().min(1, "Veuillez sélectionner votre style"),
  preferredFormat: z.array(z.string()).min(1, "Sélectionnez au moins un format"),
  
  // Domaines d'intérêt
  interestAreas: z.array(z.string()).min(1, "Sélectionnez au moins un domaine"),
  
  // Motivations
  motivation: z.string().min(10, "Décrivez vos motivations (min 10 caractères)")
});

type ProfileEvaluationForm = z.infer<typeof profileEvaluationSchema>;

const ProfileEvaluation = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  interface RecommendationsType {
    level: string;
    primaryPath: string;
    estimatedDuration: number;
    recommendedModules: string[];
    learningPlan: Array<{
      week: number;
      focus: string;
      activities: string[];
    }>;
    strengths: string[];
    areasToFocus: string[];
  }

  const [recommendations, setRecommendations] = useState<RecommendationsType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<ProfileEvaluationForm>({
    resolver: zodResolver(profileEvaluationSchema),
    defaultValues: {
      name: '',
      currentRole: '',
      experience: '',
      company: '',
      aiExperience: '',
      programmingLevel: '',
      mathLevel: '',
      learningGoals: [],
      timeAvailable: '',
      learningStyle: '',
      preferredFormat: [],
      interestAreas: [],
      motivation: ''
    }
  });

  const steps = [
    { title: "Profil personnel", icon: <User className="w-5 h-5" /> },
    { title: "Niveau actuel", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Objectifs", icon: <Target className="w-5 h-5" /> },
    { title: "Préférences", icon: <Lightbulb className="w-5 h-5" /> },
    { title: "Résultats", icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const experienceLevels = [
    { value: "0-2", label: "0-2 ans" },
    { value: "2-5", label: "2-5 ans" },
    { value: "5-10", label: "5-10 ans" },
    { value: "10+", label: "10+ ans" }
  ];

  const aiExperienceLevels = [
    { value: "none", label: "Aucune expérience" },
    { value: "basic", label: "Notions de base" },
    { value: "intermediate", label: "Intermédiaire" },
    { value: "advanced", label: "Avancé" },
    { value: "expert", label: "Expert" }
  ];

  const learningGoalsOptions = [
    "Comprendre les fondamentaux de l'IA",
    "Développer des applications ML",
    "Analyser des données avec l'IA",
    "Créer des chatbots intelligents",
    "Implémenter de la vision par ordinateur",
    "Piloter des projets IA",
    "Optimiser les processus métier",
    "Se reconvertir en IA"
  ];

  const learningStyles = [
    { value: "visual", label: "Visuel (schémas, graphiques)" },
    { value: "hands-on", label: "Pratique (exercices, projets)" },
    { value: "theoretical", label: "Théorique (concepts, formules)" },
    { value: "mixed", label: "Mixte" }
  ];

  const formatOptions = [
    "Modules interactifs",
    "Vidéos explicatives",
    "Exercices pratiques",
    "Projets guidés",
    "Quiz adaptatifs",
    "Sessions live",
    "Documentation",
    "Cas d'usage réels"
  ];

  const interestAreasOptions = [
    "Machine Learning",
    "Deep Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Data Science",
    "MLOps",
    "IA Éthique",
    "IA Business",
    "Robotique",
    "IA Générative"
  ];

  const analyzeProfile = async (data: ProfileEvaluationForm) => {
    setIsAnalyzing(true);
    
    try {
      // Simulation d'analyse IA personnalisée
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Générer des recommandations basées sur le profil
      const profileAnalysis = {
        level: data.aiExperience,
        primaryPath: data.learningGoals[0],
        estimatedDuration: calculateDuration(data),
        recommendedModules: getRecommendedModules(data),
        learningPlan: generateLearningPlan(data),
        strengths: identifyStrengths(data),
        areasToFocus: identifyFocusAreas(data)
      };

      setRecommendations(profileAnalysis);
      setCurrentStep(4);
      
      toast({
        title: "Analyse terminée",
        description: "Votre profil IA personnalisé a été généré avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'analyser le profil. Veuillez réessayer.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateDuration = (data: ProfileEvaluationForm) => {
    const baseHours = data.aiExperience === 'none' ? 40 : 
                     data.aiExperience === 'basic' ? 30 : 
                     data.aiExperience === 'intermediate' ? 20 : 15;
    
    const goalMultiplier = data.learningGoals.length * 0.3;
    return Math.round(baseHours + goalMultiplier);
  };

  const getRecommendedModules = (data: ProfileEvaluationForm) => {
    const modules = [];
    
    if (data.aiExperience === 'none' || data.aiExperience === 'basic') {
      modules.push('ia-fundamentals');
    }
    
    if (data.learningGoals.includes('Développer des applications ML')) {
      modules.push('ml-practical');
    }
    
    if (data.learningGoals.includes('Analyser des données avec l\'IA')) {
      modules.push('data-science');
    }
    
    if (data.interestAreas.includes('Natural Language Processing')) {
      modules.push('nlp-processing');
    }
    
    if (data.interestAreas.includes('Computer Vision')) {
      modules.push('computer-vision');
    }
    
    if (data.learningGoals.includes('Piloter des projets IA')) {
      modules.push('ai-business');
    }
    
    return modules;
  };

  const generateLearningPlan = (data: ProfileEvaluationForm) => {
    const plan = [];
    const timePerWeek = data.timeAvailable === 'low' ? 2 : 
                       data.timeAvailable === 'medium' ? 5 : 10;
    
    if (data.aiExperience === 'none') {
      plan.push({
        week: 1,
        focus: "Fondamentaux de l'IA",
        activities: ["Concepts de base", "Types d'IA", "Applications pratiques"]
      });
    }
    
    plan.push({
      week: plan.length + 1,
      focus: "Application pratique",
      activities: ["Premier projet", "Outils essentiels", "Exercices guidés"]
    });
    
    return plan;
  };

  const identifyStrengths = (data: ProfileEvaluationForm) => {
    const strengths = [];
    
    if (data.programmingLevel === 'advanced' || data.programmingLevel === 'expert') {
      strengths.push("Solides compétences en programmation");
    }
    
    if (data.mathLevel === 'advanced' || data.mathLevel === 'expert') {
      strengths.push("Bases mathématiques solides");
    }
    
    if (data.experience === '10+') {
      strengths.push("Expérience professionnelle étendue");
    }
    
    if (data.learningStyle === 'hands-on') {
      strengths.push("Approche pratique favorisant l'apprentissage rapide");
    }
    
    return strengths;
  };

  const identifyFocusAreas = (data: ProfileEvaluationForm) => {
    const areas = [];
    
    if (data.aiExperience === 'none') {
      areas.push("Concepts fondamentaux de l'IA");
    }
    
    if (data.programmingLevel === 'none' || data.programmingLevel === 'basic') {
      areas.push("Renforcement des compétences en programmation");
    }
    
    if (data.mathLevel === 'none' || data.mathLevel === 'basic') {
      areas.push("Révision des bases mathématiques");
    }
    
    return areas;
  };

  const onSubmit = (data: ProfileEvaluationForm) => {
    analyzeProfile(data);
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
                Évaluation de Profil IA
              </h1>
              <p className="text-lg text-blue-200">
                Personnalisez votre parcours d'apprentissage
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
          {currentStep < 4 ? (
            <Card className="bg-blue-800/50 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  {steps[currentStep].title}
                </CardTitle>
                <CardDescription className="text-blue-200">
                  {currentStep === 0 && "Parlez-nous de vous et de votre parcours professionnel"}
                  {currentStep === 1 && "Évaluez votre niveau actuel dans les domaines clés"}
                  {currentStep === 2 && "Définissez vos objectifs d'apprentissage"}
                  {currentStep === 3 && "Indiquez vos préférences d'apprentissage"}
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
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Nom complet</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Votre nom"
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
                          name="currentRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Poste actuel</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ex: Développeur, Analyste, Manager..."
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
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Années d'expérience professionnelle</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez votre expérience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  {experienceLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
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
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Entreprise (optionnel)</FormLabel>
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
                      </div>
                    )}

                    {/* Étape 1: Niveau actuel */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="aiExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Expérience en Intelligence Artificielle</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-2"
                                >
                                  {aiExperienceLevels.map((level) => (
                                    <div key={level.value} className="flex items-center space-x-2">
                                      <RadioGroupItem value={level.value} id={level.value} />
                                      <label
                                        htmlFor={level.value}
                                        className="text-blue-200 cursor-pointer"
                                      >
                                        {level.label}
                                      </label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="programmingLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Niveau en programmation</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez votre niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  {aiExperienceLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
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
                          name="mathLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Niveau en mathématiques/statistiques</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez votre niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  {aiExperienceLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                          name="learningGoals"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-white">Objectifs d'apprentissage (sélectionnez plusieurs)</FormLabel>
                              <div className="space-y-2">
                                {learningGoalsOptions.map((goal) => (
                                  <FormField
                                    key={goal}
                                    control={form.control}
                                    name="learningGoals"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(goal)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...(field.value || []), goal]
                                                : field.value?.filter((value) => value !== goal) || [];
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-blue-200 font-normal cursor-pointer">
                                          {goal}
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
                          name="timeAvailable"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Temps disponible par semaine</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="low" id="low" />
                                    <label htmlFor="low" className="text-blue-200 cursor-pointer">
                                      1-2 heures (apprentissage lent)
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="medium" id="medium" />
                                    <label htmlFor="medium" className="text-blue-200 cursor-pointer">
                                      3-5 heures (rythme modéré)
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="high" id="high" />
                                    <label htmlFor="high" className="text-blue-200 cursor-pointer">
                                      6+ heures (apprentissage intensif)
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Étape 3: Préférences */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="learningStyle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Style d'apprentissage préféré</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-2"
                                >
                                  {learningStyles.map((style) => (
                                    <div key={style.value} className="flex items-center space-x-2">
                                      <RadioGroupItem value={style.value} id={style.value} />
                                      <label
                                        htmlFor={style.value}
                                        className="text-blue-200 cursor-pointer"
                                      >
                                        {style.label}
                                      </label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="preferredFormat"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-white">Formats de contenu préférés</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {formatOptions.map((format) => (
                                  <FormField
                                    key={format}
                                    control={form.control}
                                    name="preferredFormat"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(format)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...(field.value || []), format]
                                                : field.value?.filter((value) => value !== format) || [];
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-blue-200 font-normal text-sm cursor-pointer">
                                          {format}
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
                          name="interestAreas"
                          render={() => (
                            <FormItem>
                              <FormLabel className="text-white">Domaines d'intérêt en IA</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {interestAreasOptions.map((area) => (
                                  <FormField
                                    key={area}
                                    control={form.control}
                                    name="interestAreas"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(area)}
                                            onCheckedChange={(checked) => {
                                              const updatedValue = checked
                                                ? [...(field.value || []), area]
                                                : field.value?.filter((value) => value !== area) || [];
                                              field.onChange(updatedValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-blue-200 font-normal text-sm cursor-pointer">
                                          {area}
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
                          name="motivation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Motivations et contexte</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Décrivez vos motivations pour apprendre l'IA, votre contexte professionnel, vos projets..."
                                  className="min-h-[120px] bg-blue-900 border-blue-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                      
                      {currentStep < 3 ? (
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
                          disabled={isAnalyzing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Analyse en cours...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Générer mon profil IA
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
            // Résultats de l'évaluation
            recommendations && (
              <div className="space-y-6">
                <Card className="bg-green-800/50 border-green-700">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center">
                      <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                      Votre Profil IA Personnalisé
                    </CardTitle>
                    <CardDescription className="text-green-200">
                      Recommandations basées sur votre évaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Niveau estimé</h3>
                          <Badge variant="outline" className="text-blue-300 border-blue-500">
                            {recommendations.level === 'none' ? 'Débutant' :
                             recommendations.level === 'basic' ? 'Débutant+' :
                             recommendations.level === 'intermediate' ? 'Intermédiaire' :
                             recommendations.level === 'advanced' ? 'Avancé' : 'Expert'}
                          </Badge>
                        </div>
                        
                        <div className="p-4 bg-purple-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Durée estimée</h3>
                          <div className="flex items-center text-purple-200">
                            <Clock className="w-4 h-4 mr-2" />
                            {recommendations.estimatedDuration} heures de formation
                          </div>
                        </div>
                        
                        <div className="p-4 bg-orange-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Parcours recommandé</h3>
                          <div className="flex items-center text-orange-200">
                            <Target className="w-4 h-4 mr-2" />
                            {recommendations.primaryPath}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-green-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Points forts identifiés</h3>
                          <ul className="space-y-1">
                            {recommendations.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-center text-green-200 text-sm">
                                <CheckCircle className="w-3 h-3 mr-2" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-yellow-700 rounded-lg">
                          <h3 className="text-lg font-semibold text-white mb-2">Axes de développement</h3>
                          <ul className="space-y-1">
                            {recommendations.areasToFocus.map((area: string, index: number) => (
                              <li key={index} className="flex items-center text-yellow-200 text-sm">
                                <AlertCircle className="w-3 h-3 mr-2" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-blue-700">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => setLocation('/ia')}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Commencer ma formation
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-blue-500 text-blue-300 hover:bg-blue-600"
                          onClick={() => {
                            setCurrentStep(0);
                            setRecommendations(null);
                            form.reset();
                          }}
                        >
                          Refaire l'évaluation
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