import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Code, Users, Search, Network } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCyberQuest } from '@/contexts/CyberQuestContext';

// Schema pour la validation du formulaire
const characterSchema = z.object({
  characterName: z.string().min(3, { message: 'Le nom de votre agent doit comporter au moins 3 caractères' }).max(30, { message: 'Le nom de votre agent ne peut pas dépasser 30 caractères' }),
  archetype: z.enum(['defender', 'hacker', 'investigator', 'social', 'analyst'], {
    required_error: 'Veuillez sélectionner un archétype',
  })
});

type CharacterFormValues = z.infer<typeof characterSchema>;

// Définition des archétypes
interface Archetype {
  id: 'defender' | 'hacker' | 'investigator' | 'social' | 'analyst';
  name: string;
  description: string;
  icon: React.ReactNode;
  baseStats: {
    intelligence: number;
    perception: number;
    charisma: number;
    technicalKnowledge: number;
  };
  startingSkills: string[];
  gradient: string;
}

const archetypes: Archetype[] = [
  {
    id: 'defender',
    name: 'Défenseur',
    description: 'Spécialiste en sécurité périmétrique, protection des systèmes et réponse aux incidents',
    icon: <Shield size={24} />,
    baseStats: {
      intelligence: 6,
      perception: 7,
      charisma: 4,
      technicalKnowledge: 8
    },
    startingSkills: ['Configuration de pare-feu', 'Supervision de sécurité', 'Analyse de logs'],
    gradient: 'from-blue-600 to-blue-800'
  },
  {
    id: 'hacker',
    name: 'Hacker Éthique',
    description: 'Expert en test d\'intrusion, découverte de vulnérabilités et exploitation de failles',
    icon: <Code size={24} />,
    baseStats: {
      intelligence: 8,
      perception: 6,
      charisma: 3,
      technicalKnowledge: 8
    },
    startingSkills: ['Test d\'intrusion', 'Programmation', 'Rétro-ingénierie'],
    gradient: 'from-emerald-600 to-emerald-800'
  },
  {
    id: 'investigator',
    name: 'Investigateur',
    description: 'Spécialiste en analyse forensique, collecte de preuves et investigation numérique',
    icon: <Search size={24} />,
    baseStats: {
      intelligence: 7,
      perception: 8,
      charisma: 5,
      technicalKnowledge: 5
    },
    startingSkills: ['Analyse forensique', 'Récupération de données', 'Traçage de menaces'],
    gradient: 'from-amber-600 to-amber-800'
  },
  {
    id: 'social',
    name: 'Ingénieur Social',
    description: 'Expert en manipulation psychologique, sensibilisation et contre-mesures d\'ingénierie sociale',
    icon: <Users size={24} />,
    baseStats: {
      intelligence: 6,
      perception: 7,
      charisma: 9,
      technicalKnowledge: 3
    },
    startingSkills: ['Tactiques de persuasion', 'Analyse comportementale', 'Formation de sensibilisation'],
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 'analyst',
    name: 'Analyste SOC',
    description: 'Spécialiste en surveillance, détection et analyse des menaces en temps réel',
    icon: <Network size={24} />,
    baseStats: {
      intelligence: 7,
      perception: 8,
      charisma: 4,
      technicalKnowledge: 6
    },
    startingSkills: ['Triage d\'alertes', 'Corrélation de données', 'Investigation des menaces'],
    gradient: 'from-red-600 to-red-800'
  }
];

const CharacterCreation: React.FC = () => {
  const { refreshGameState } = useCyberQuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);

  // Initialiser react-hook-form
  const form = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      characterName: '',
      archetype: undefined
    }
  });

  const onSubmit = async (values: CharacterFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Utiliser la route correcte '/api/cyber-quest/player' au lieu de '/api/cyber-quest/player/create'
      const response = await fetch('/api/cyber-quest/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          stats: selectedArchetype?.baseStats,
          // Obtenir l'ID utilisateur actuel (normalement, cela devrait être géré par le backend)
          userId: localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substring(2, 9),
          userName: values.characterName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la création de votre personnage');
      }
      
      toast({
        title: "Agent créé avec succès",
        description: `Bienvenue, Agent ${values.characterName}! Prêt pour votre première mission?`,
      });
      
      // Rafraîchir les données du joueur
      await refreshGameState();
      
    } catch (error) {
      console.error("Erreur lors de la création du personnage:", error);
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quand un archétype est sélectionné, mettre à jour le formulaire
  const handleArchetypeSelect = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
    form.setValue('archetype', archetype.id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Création de votre Agent CyberQuest</h1>
          <p className="text-lg text-gray-300">
            Choisissez l'archétype qui correspond à votre style de jeu et définissez l'identité de votre agent.
          </p>
        </header>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Nom du personnage */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Identité de l'agent</CardTitle>
                <CardDescription>
                  Choisissez un nom d'agent pour votre nouvelle identité au sein de l'agence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="characterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'agent</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Entrez le nom de votre agent..." 
                          {...field} 
                          className="bg-gray-700 border-gray-600"
                        />
                      </FormControl>
                      <FormDescription>
                        Ce nom sera utilisé pour vous identifier au sein de l'agence
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Sélection d'archétype */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Choix de spécialisation</CardTitle>
                <CardDescription>
                  Chaque archétype possède des attributs et compétences de départ uniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="archetype"
                  render={({ field }) => (
                    <FormItem className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {archetypes.map((archetype) => (
                          <div
                            key={archetype.id}
                            className={`
                              cursor-pointer relative rounded-lg p-4 border-2 transition-all
                              ${field.value === archetype.id 
                                ? 'border-blue-500 bg-gradient-to-br ' + archetype.gradient + ' bg-opacity-20' 
                                : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                              }
                            `}
                            onClick={() => handleArchetypeSelect(archetype)}
                          >
                            <div className="flex items-center mb-3">
                              <div className="p-2 rounded-full bg-gray-700 mr-3">
                                {archetype.icon}
                              </div>
                              <h3 className="font-bold">{archetype.name}</h3>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">
                              {archetype.description}
                            </p>
                            {field.value === archetype.id && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Aperçu */}
            {selectedArchetype && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Aperçu de votre agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="stats">
                    <TabsList className="bg-gray-700">
                      <TabsTrigger value="stats">Attributs</TabsTrigger>
                      <TabsTrigger value="skills">Compétences</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stats" className="mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Intelligence</p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${selectedArchetype.baseStats.intelligence * 10}%` }}></div>
                          </div>
                          <p className="text-right text-xs">{selectedArchetype.baseStats.intelligence}/10</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Perception</p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${selectedArchetype.baseStats.perception * 10}%` }}></div>
                          </div>
                          <p className="text-right text-xs">{selectedArchetype.baseStats.perception}/10</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Charisme</p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${selectedArchetype.baseStats.charisma * 10}%` }}></div>
                          </div>
                          <p className="text-right text-xs">{selectedArchetype.baseStats.charisma}/10</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Connaissance Technique</p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${selectedArchetype.baseStats.technicalKnowledge * 10}%` }}></div>
                          </div>
                          <p className="text-right text-xs">{selectedArchetype.baseStats.technicalKnowledge}/10</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="skills" className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Compétences de départ:</h4>
                      <ul className="space-y-2">
                        {selectedArchetype.startingSkills.map((skill, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
            
            {/* Bouton de soumission */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? 'Création en cours...' : 'Créer mon agent'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CharacterCreation;