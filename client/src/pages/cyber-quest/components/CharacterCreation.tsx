import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Brain, 
  Eye, 
  Users, 
  Terminal 
} from "lucide-react";

// Schéma de validation pour la création de personnage
const characterSchema = z.object({
  characterName: z.string().min(2, {
    message: "Le nom de votre agent doit comporter au moins 2 caractères.",
  }).max(30, {
    message: "Le nom de votre agent ne peut pas dépasser 30 caractères.",
  }),
  specialty: z.enum(["investigation", "technical", "social"]),
  intelligence: z.number().min(3).max(8),
  perception: z.number().min(3).max(8),
  charisma: z.number().min(3).max(8),
  technicalKnowledge: z.number().min(3).max(8),
});

const CharacterCreation: React.FC = () => {
  const { toast } = useToast();
  const [pointsRemaining, setPointsRemaining] = useState(10);
  const [tab, setTab] = useState("identity");
  const { startMission, refreshGameState } = useCyberQuest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form hook
  const form = useForm<z.infer<typeof characterSchema>>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      characterName: "",
      specialty: "investigation",
      intelligence: 5,
      perception: 5,
      charisma: 5,
      technicalKnowledge: 5,
    },
  });

  // Surveillez les changements d'attributs pour calculer les points restants
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && ['intelligence', 'perception', 'charisma', 'technicalKnowledge'].includes(name)) {
        const intelligence = form.getValues('intelligence') || 5;
        const perception = form.getValues('perception') || 5;
        const charisma = form.getValues('charisma') || 5;
        const technicalKnowledge = form.getValues('technicalKnowledge') || 5;
        
        // Points de base: 20 (5 x 4 attributs)
        // Points alloués: somme des attributs actuels
        const allocated = intelligence + perception + charisma + technicalKnowledge;
        setPointsRemaining(30 - allocated);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Gérer le changement de valeur des attributs
  const handleAttributeChange = (name: string, value: number) => {
    const currentValue = form.getValues(name as any) || 5;
    const diff = value - currentValue;
    
    // Si on n'a plus de points et qu'on essaie d'augmenter
    if (pointsRemaining <= 0 && diff > 0) {
      return;
    }
    
    // Si on va en dessous du minimum
    if (value < 3) {
      return;
    }
    
    // Si on va au-dessus du maximum
    if (value > 8) {
      return;
    }
    
    form.setValue(name as any, value, { shouldValidate: true });
  };

  const onSubmit = async (data: z.infer<typeof characterSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Faire une requête au serveur pour créer le personnage
      const response = await fetch('/api/cyber-quest/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '27563aac-9983-46e3-bd83-519845ed1d5e', // ID temporaire, normalement récupéré de l'auth
          userName: 'Utilisateur', // Nom temporaire, normalement récupéré de l'auth
          characterName: data.characterName,
          intelligence: data.intelligence,
          perception: data.perception,
          charisma: data.charisma,
          technicalKnowledge: data.technicalKnowledge,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création du personnage');
      }
      
      const result = await response.json();
      
      toast({
        title: "Personnage créé !",
        description: `Bienvenue, Agent ${data.characterName}. Votre aventure commence maintenant.`,
      });
      
      // Rafraîchir les données du jeu
      refreshGameState();
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-800 border-blue-500">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-blue-400">Création d'Agent CyberQuest</CardTitle>
          <CardDescription className="text-gray-300">
            Personnalisez votre profil d'agent pour commencer votre mission
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <Tabs defaultValue="identity" value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="w-full bg-gray-700">
                  <TabsTrigger value="identity" className="flex-1">Identité</TabsTrigger>
                  <TabsTrigger value="specialty" className="flex-1">Spécialité</TabsTrigger>
                  <TabsTrigger value="attributes" className="flex-1">Attributs</TabsTrigger>
                  <TabsTrigger value="summary" className="flex-1">Résumé</TabsTrigger>
                </TabsList>
                
                {/* Onglet Identité */}
                <TabsContent value="identity" className="py-4">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="characterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de code</FormLabel>
                          <FormControl>
                            <Input placeholder="Entrez votre nom de code" {...field} className="bg-gray-700" />
                          </FormControl>
                          <FormDescription>
                            Votre identité d'agent dans le monde cybernétique.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-center mt-8">
                      <Button 
                        type="button" 
                        onClick={() => setTab("specialty")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet Spécialité */}
                <TabsContent value="specialty" className="py-4">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialité</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                              <FormItem className="flex flex-col items-center space-y-3 rounded-md border border-blue-500 p-4 bg-gray-700">
                                <FormControl>
                                  <RadioGroupItem value="investigation" className="sr-only" />
                                </FormControl>
                                <Eye className="h-10 w-10 text-blue-400" />
                                <FormLabel className="font-normal">
                                  <div className="text-center">
                                    <h3 className="text-lg font-semibold">Investigation</h3>
                                    <p className="text-sm text-gray-400">
                                      Spécialiste en analyse d'indices et résolution d'enquêtes.
                                    </p>
                                  </div>
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex flex-col items-center space-y-3 rounded-md border border-blue-500 p-4 bg-gray-700">
                                <FormControl>
                                  <RadioGroupItem value="technical" className="sr-only" />
                                </FormControl>
                                <Terminal className="h-10 w-10 text-blue-400" />
                                <FormLabel className="font-normal">
                                  <div className="text-center">
                                    <h3 className="text-lg font-semibold">Technique</h3>
                                    <p className="text-sm text-gray-400">
                                      Expert en systèmes informatiques et réseaux sécurisés.
                                    </p>
                                  </div>
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex flex-col items-center space-y-3 rounded-md border border-blue-500 p-4 bg-gray-700">
                                <FormControl>
                                  <RadioGroupItem value="social" className="sr-only" />
                                </FormControl>
                                <Users className="h-10 w-10 text-blue-400" />
                                <FormLabel className="font-normal">
                                  <div className="text-center">
                                    <h3 className="text-lg font-semibold">Social</h3>
                                    <p className="text-sm text-gray-400">
                                      Maître en ingénierie sociale et manipulation psychologique.
                                    </p>
                                  </div>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between mt-8">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setTab("identity")}
                      >
                        Retour
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setTab("attributes")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet Attributs */}
                <TabsContent value="attributes" className="py-4">
                  <div className="space-y-6">
                    <div className="mb-6 text-center">
                      <h3 className="text-lg font-semibold">Points d'attributs restants: {pointsRemaining}</h3>
                      <p className="text-sm text-gray-400">
                        Répartissez vos points dans les attributs ci-dessous (min: 3, max: 8)
                      </p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Brain className="h-5 w-5 mr-2 text-blue-400" />
                            <label className="font-medium">Intelligence</label>
                          </div>
                          <span className="text-lg font-semibold">{form.watch('intelligence')}</span>
                        </div>
                        <Slider
                          value={[form.watch('intelligence')]}
                          min={3}
                          max={8}
                          step={1}
                          className="bg-blue-800"
                          onValueChange={(value) => handleAttributeChange('intelligence', value[0])}
                        />
                        <p className="text-xs text-gray-400">
                          Capacité d'analyse, de résolution de problèmes et de conception de stratégies.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-blue-400" />
                            <label className="font-medium">Perception</label>
                          </div>
                          <span className="text-lg font-semibold">{form.watch('perception')}</span>
                        </div>
                        <Slider
                          value={[form.watch('perception')]}
                          min={3}
                          max={8}
                          step={1}
                          className="bg-blue-800"
                          onValueChange={(value) => handleAttributeChange('perception', value[0])}
                        />
                        <p className="text-xs text-gray-400">
                          Attention aux détails, détection de menaces et reconnaissance de modèles.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-blue-400" />
                            <label className="font-medium">Charisme</label>
                          </div>
                          <span className="text-lg font-semibold">{form.watch('charisma')}</span>
                        </div>
                        <Slider
                          value={[form.watch('charisma')]}
                          min={3}
                          max={8}
                          step={1}
                          className="bg-blue-800"
                          onValueChange={(value) => handleAttributeChange('charisma', value[0])}
                        />
                        <p className="text-xs text-gray-400">
                          Capacité de persuasion, négociation et manipulation sociale.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <Terminal className="h-5 w-5 mr-2 text-blue-400" />
                            <label className="font-medium">Connaissance Technique</label>
                          </div>
                          <span className="text-lg font-semibold">{form.watch('technicalKnowledge')}</span>
                        </div>
                        <Slider
                          value={[form.watch('technicalKnowledge')]}
                          min={3}
                          max={8}
                          step={1}
                          className="bg-blue-800"
                          onValueChange={(value) => handleAttributeChange('technicalKnowledge', value[0])}
                        />
                        <p className="text-xs text-gray-400">
                          Maîtrise des systèmes informatiques, réseaux et techniques de sécurité.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setTab("specialty")}
                      >
                        Retour
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setTab("summary")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continuer
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Onglet Résumé */}
                <TabsContent value="summary" className="py-4">
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold">Profil d'Agent</h3>
                      <p className="text-sm text-gray-400">
                        Vérifiez vos informations avant de commencer votre mission
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-lg">Identité</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Nom de code:</span>
                              <span className="font-semibold">{form.watch('characterName') || 'Non défini'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Spécialité:</span>
                              <span className="font-semibold capitalize">
                                {form.watch('specialty') === 'investigation' && 'Investigation'}
                                {form.watch('specialty') === 'technical' && 'Technique'}
                                {form.watch('specialty') === 'social' && 'Social'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-lg">Attributs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center">
                                <Brain className="h-4 w-4 mr-1" /> Intelligence:
                              </span>
                              <span className="font-semibold">{form.watch('intelligence')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center">
                                <Eye className="h-4 w-4 mr-1" /> Perception:
                              </span>
                              <span className="font-semibold">{form.watch('perception')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center">
                                <Users className="h-4 w-4 mr-1" /> Charisme:
                              </span>
                              <span className="font-semibold">{form.watch('charisma')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 flex items-center">
                                <Terminal className="h-4 w-4 mr-1" /> Conn. Technique:
                              </span>
                              <span className="font-semibold">{form.watch('technicalKnowledge')}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setTab("attributes")}
                      >
                        Retour
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Création...' : 'Confirmer et commencer'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </form>
        </Form>
        
        <CardFooter className="text-center flex justify-center border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400">
            <Shield className="inline-block h-4 w-4 mr-1" />
            CyberQuest - Une simulation immersive pour l'entraînement en cybersécurité
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CharacterCreation;