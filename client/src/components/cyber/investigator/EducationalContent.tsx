import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book, Download, ChevronRight, ChevronDown, BookOpen, Compass, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface EducationalContentProps {
  className?: string;
}

// Sujets pédagogiques pour l'investigation numérique
const educationalTopics = [
  {
    id: 'basic-methodology',
    title: 'Méthodologie d\'investigation',
    description: 'Les principes fondamentaux et étapes de l\'investigation numérique',
    category: 'fondamentaux',
    icon: <Compass className="w-5 h-5" />
  },
  {
    id: 'evidence-collection',
    title: 'Collecte de preuves numériques',
    description: 'Techniques pour acquérir et préserver les preuves numériques',
    category: 'fondamentaux',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'log-analysis',
    title: 'Analyse de logs système',
    description: 'Interpréter les journaux système pour repérer les activités suspectes',
    category: 'technique',
    icon: <Search className="w-5 h-5" />
  },
  {
    id: 'memory-forensics',
    title: 'Analyse de mémoire',
    description: 'Extraction et analyse de la mémoire volatile des systèmes compromis',
    category: 'technique',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    id: 'malware-analysis',
    title: 'Analyse de malware',
    description: 'Techniques pour identifier et analyser les logiciels malveillants',
    category: 'technique',
    icon: <Book className="w-5 h-5" />
  },
  {
    id: 'network-forensics',
    title: 'Investigation réseau',
    description: 'Analyser le trafic réseau pour détecter les comportements anormaux',
    category: 'technique',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'timeline-analysis',
    title: 'Analyse de chronologie',
    description: 'Construction et analyse des chronologies d\'incidents',
    category: 'méthodologie',
    icon: <ChevronRight className="w-5 h-5" />
  },
  {
    id: 'reporting',
    title: 'Rédaction de rapports',
    description: 'Documenter les résultats de l\'investigation de manière professionnelle',
    category: 'méthodologie',
    icon: <FileText className="w-5 h-5" />
  }
];

export default function EducationalContent({ className }: EducationalContentProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Récupération du contenu pédagogique pour le sujet sélectionné
  const { data: contentData, isLoading, isError } = useQuery({
    queryKey: ['cyber-investigator', 'educational-content', selectedTopic],
    queryFn: async () => {
      if (!selectedTopic) return null;
      return apiRequest<{ content: string, topic: string }>('/api/cyber-investigator/educational-content', {
        method: 'POST',
        body: { topic: selectedTopic }
      });
    },
    enabled: !!selectedTopic,
  });

  // Filtrage des sujets en fonction de la recherche et de la catégorie
  const filteredTopics = educationalTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || topic.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Fonction pour sélectionner un sujet
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
  };

  // Formatage simple du contenu en sections
  const formatContent = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Séparation par lignes
    const lines = content.split('\n');
    let sections: {title: string, content: string[]}[] = [];
    let currentSection: {title: string, content: string[]} = {title: 'Introduction', content: []};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Détection des titres (lignes qui commencent par # ou qui sont en majuscules et se terminent par :)
      if (trimmedLine.startsWith('#') || (/^[A-Z][A-Z\s]+:$/.test(trimmedLine))) {
        // Enregistrer la section précédente si elle a du contenu
        if (currentSection.content.length > 0) {
          sections.push({...currentSection});
        }
        
        // Créer une nouvelle section
        currentSection = {
          title: trimmedLine.replace(/^#+\s*/, '').replace(/:$/, ''),
          content: []
        };
      } 
      // Ligne normale
      else if (trimmedLine.length > 0) {
        currentSection.content.push(trimmedLine);
      }
    });
    
    // Ajouter la dernière section si elle contient du contenu
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">{section.title}</h3>
            <div className="space-y-2">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-gray-700 dark:text-gray-300">{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn("border shadow-md", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6" />
          <CardTitle>Ressources d'apprentissage</CardTitle>
        </div>
        <p className="text-blue-100 mt-1 text-sm">
          Explorez les concepts et techniques d'investigation numérique
        </p>
      </CardHeader>
      
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="topics">Sujets</TabsTrigger>
          <TabsTrigger value="content" disabled={!selectedTopic}>Contenu</TabsTrigger>
        </TabsList>
        
        {/* Liste des sujets */}
        <TabsContent value="topics" className="p-0">
          <div className="p-4 border-b">
            <div className="flex flex-col space-y-4">
              <Input
                placeholder="Rechercher un sujet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="fondamentaux">Fondamentaux</SelectItem>
                  <SelectItem value="technique">Techniques</SelectItem>
                  <SelectItem value="méthodologie">Méthodologies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <ScrollArea className="h-[400px] sm:h-[450px] p-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredTopics.map((topic) => (
                <Card 
                  key={topic.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTopic === topic.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : ""
                  )}
                  onClick={() => handleSelectTopic(topic.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1 bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        {topic.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{topic.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                        <Badge className="mt-2" variant="outline">{topic.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredTopics.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun sujet trouvé pour cette recherche
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Contenu du sujet sélectionné */}
        <TabsContent value="content" className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              {selectedTopic && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {educationalTopics.find(t => t.id === selectedTopic)?.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {educationalTopics.find(t => t.id === selectedTopic)?.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)}>
                      Retour aux sujets
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-6 w-2/3 mt-6" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : isError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-300">
                      Une erreur est survenue lors du chargement du contenu. Veuillez réessayer.
                    </div>
                  ) : contentData ? (
                    <div className="prose dark:prose-invert max-w-none">
                      {formatContent(contentData.content)}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </ScrollArea>
          
          <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Dernière mise à jour: {new Date().toLocaleDateString()}
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                <Download size={16} /> Télécharger
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}