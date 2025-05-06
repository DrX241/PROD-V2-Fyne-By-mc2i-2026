import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { Shield, Brain, Eye, MessageCircle, Cpu } from "lucide-react";

// Schéma de validation pour le formulaire de création de personnage
const characterSchema = z.object({
  characterName: z.string()
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
    .max(20, { message: "Le nom ne doit pas dépasser 20 caractères" })
    .refine(name => /^[a-zA-Z0-9_-]+$/.test(name), {
      message: "Le nom ne peut contenir que des lettres, chiffres, tirets et underscores",
    })
});

type CharacterCreationForm = z.infer<typeof characterSchema>;

const CharacterCreation: React.FC = () => {
  const { refreshGameState } = useCyberQuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('analyst');
  
  // Configuration du formulaire avec validation
  const form = useForm<CharacterCreationForm>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      characterName: '',
    },
  });

  // Soumission du formulaire
  const onSubmit = async (data: CharacterCreationForm) => {
    setIsSubmitting(true);
    
    try {
      // Les attributs initiaux seront déterminés par l'archétype choisi
      const initialAttributes = getInitialAttributes(selectedArchetype);
      
      // Appel à l'API pour créer le personnage
      const response = await fetch('/api/cyber-quest/player/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ...initialAttributes,
          archetype: selectedArchetype,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la création du personnage");
      }
      
      // Mettre à jour l'état global du jeu
      await refreshGameState();
      
      toast({
        title: "Personnage créé !",
        description: `Bienvenue, Agent ${data.characterName}. Votre aventure commence.`,
      });
    } catch (error) {
      console.error("Erreur lors de la création du personnage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer votre personnage. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtenir les attributs initiaux en fonction de l'archétype
  const getInitialAttributes = (archetype: string) => {
    switch (archetype) {
      case 'analyst':
        return { 
          intelligence: 7, 
          perception: 6, 
          charisma: 4, 
          technicalKnowledge: 5 
        };
      case 'field-agent':
        return { 
          intelligence: 5, 
          perception: 7, 
          charisma: 6, 
          technicalKnowledge: 4 
        };
      case 'hacker':
        return { 
          intelligence: 6, 
          perception: 5, 
          charisma: 4, 
          technicalKnowledge: 7 
        };
      case 'communicator':
        return { 
          intelligence: 5, 
          perception: 4, 
          charisma: 7, 
          technicalKnowledge: 6 
        };
      default:
        return { 
          intelligence: 5, 
          perception: 5, 
          charisma: 5, 
          technicalKnowledge: 5 
        };
    }
  };

  // Obtenir les détails de l'archétype
  const getArchetypeDetails = (archetype: string) => {
    switch (archetype) {
      case 'analyst':
        return {
          title: "Analyste de Sécurité",
          description: "Expert en analyse de données et détection de menaces, vous excellez dans l'identification de patterns suspects.",
          strengths: ["Intelligence élevée", "Bonnes capacités d'observation", "Analyse de données"],
          icon: <Brain className="h-12 w-12 text-blue-500" />
        };
      case 'field-agent':
        return {
          title: "Agent de Terrain",
          description: "Spécialiste des opérations tactiques, vous êtes formé pour l'investigation et la reconnaissance en environnement hostile.",
          strengths: ["Perception aiguisée", "Bonnes compétences sociales", "Adaptabilité"],
          icon: <Eye className="h-12 w-12 text-green-500" />
        };
      case 'hacker':
        return {
          title: "Expert Technique",
          description: "Virtuose des systèmes informatiques, vous maîtrisez les technologies avancées et le hacking éthique.",
          strengths: ["Connaissances techniques supérieures", "Résolution de problèmes", "Pensée créative"],
          icon: <Cpu className="h-12 w-12 text-purple-500" />
        };
      case 'communicator':
        return {
          title: "Communicant Stratégique",
          description: "Excellent en relations interpersonnelles, vous excellez dans la négociation et la gestion de crise.",
          strengths: ["Charisme exceptionnel", "Persuasion", "Gestion d'équipe"],
          icon: <MessageCircle className="h-12 w-12 text-amber-500" />
        };
      default:
        return {
          title: "Nouvel Agent",
          description: "Un profil polyvalent et équilibré, prêt à se spécialiser.",
          strengths: ["Polyvalence", "Adaptabilité", "Potentiel"],
          icon: <Shield className="h-12 w-12 text-gray-500" />
        };
    }
  };

  const archetypeDetails = getArchetypeDetails(selectedArchetype);
  const initialAttributes = getInitialAttributes(selectedArchetype);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Création de Personnage</CardTitle>
          <CardDescription className="text-center">
            Bienvenue dans CyberQuest. Créez votre agent spécialisé en cybersécurité.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="identity">Identité</TabsTrigger>
              <TabsTrigger value="archetype">Archétype</TabsTrigger>
            </TabsList>
            
            <TabsContent value="identity" className="space-y-4 mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="characterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de code</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez votre nom de code" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ce nom sera votre identifiant en tant qu'agent de cybersécurité.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="archetype" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className={`p-4 rounded-lg border-2 transition-all ${selectedArchetype === 'analyst' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setSelectedArchetype('analyst')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Brain className="h-10 w-10 text-blue-500" />
                    <h3 className="font-semibold">Analyste de Sécurité</h3>
                  </div>
                </button>
                
                <button
                  className={`p-4 rounded-lg border-2 transition-all ${selectedArchetype === 'field-agent' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setSelectedArchetype('field-agent')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Eye className="h-10 w-10 text-green-500" />
                    <h3 className="font-semibold">Agent de Terrain</h3>
                  </div>
                </button>
                
                <button
                  className={`p-4 rounded-lg border-2 transition-all ${selectedArchetype === 'hacker' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setSelectedArchetype('hacker')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Cpu className="h-10 w-10 text-purple-500" />
                    <h3 className="font-semibold">Expert Technique</h3>
                  </div>
                </button>
                
                <button
                  className={`p-4 rounded-lg border-2 transition-all ${selectedArchetype === 'communicator' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setSelectedArchetype('communicator')}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <MessageCircle className="h-10 w-10 text-amber-500" />
                    <h3 className="font-semibold">Communicant Stratégique</h3>
                  </div>
                </button>
              </div>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    {archetypeDetails.icon}
                    <span>{archetypeDetails.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{archetypeDetails.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Forces:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {archetypeDetails.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-gray-500">Intelligence</p>
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${(initialAttributes.intelligence / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{initialAttributes.intelligence}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Perception</p>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${(initialAttributes.perception / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{initialAttributes.perception}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Charisme</p>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full"
                            style={{ width: `${(initialAttributes.charisma / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{initialAttributes.charisma}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Connaissance Technique</p>
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-amber-500" />
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full"
                            style={{ width: `${(initialAttributes.technicalKnowledge / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{initialAttributes.technicalKnowledge}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Création en cours..." : "Créer mon agent"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CharacterCreation;