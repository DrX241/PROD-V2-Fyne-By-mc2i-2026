import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Trophy, 
  Layers, 
  Rocket, 
  Shield, 
  BarChart, 
  Search,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AscensionThemeDetails } from '../types/cyber-ascension';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeIcon } from '../components/cyber/ThemeIcon';

// Composant pour chaque thème
const ThemeCard = ({ theme }: { theme: AscensionThemeDetails }) => {
  const [, setLocation] = useLocation();
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setLocation(`/cyber-ascension/theme/${theme.id}`)}
    >
      <div className="h-2" style={{ backgroundColor: theme.themeColor }} />
      <CardHeader>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-md" 
            style={{ backgroundColor: `${theme.themeColor}20` }}
          >
            <ThemeIcon icon={theme.icon} className="h-5 w-5" style={{ color: theme.themeColor }} />
          </div>
          <CardTitle className="text-lg">{theme.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-4 h-12 line-clamp-2">
          {theme.description}
        </CardDescription>
        <div className="mb-2 flex justify-between text-sm text-muted-foreground">
          <span>Progression</span>
          <span>{theme.progress}%</span>
        </div>
        <Progress value={theme.progress} className="h-2" />
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <div>Niveaux: {theme.unlockedLevels}/{theme.totalLevels}</div>
          <div className="text-primary font-medium">Explorer</div>
        </div>
      </CardFooter>
    </Card>
  );
};

// Le composant ThemeIcon est importé plus haut et utilisé en remplacement

export default function CyberAscension() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [customThemeDialog, setCustomThemeDialog] = useState(false);
  const [customThemeData, setCustomThemeData] = useState({
    title: '',
    description: '',
    keywords: ''
  });
  
  // Récupération des thèmes
  const { data: themesData, isLoading, error } = useQuery<{ success: boolean, themes: AscensionThemeDetails[] }>({
    queryKey: ['/api/cyber-ascension/themes'],
  });
  
  // Récupération de la progression de l'utilisateur (simulée)
  const { data: progressData } = useQuery<any>({
    queryKey: ['/api/cyber-ascension/progress', 'user123'],
  });
  
  // Méthode pour filtrer les thèmes
  const filteredThemes = themesData?.themes.filter(theme => {
    if (searchQuery) {
      return theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    if (activeTab === 'inProgress') {
      return theme.progress > 0 && theme.progress < 100;
    }
    
    if (activeTab === 'completed') {
      return theme.progress === 100;
    }
    
    if (activeTab === 'notStarted') {
      return theme.progress === 0;
    }
    
    return true;
  }) || [];
  
  // Méthode pour créer un thème personnalisé
  const handleCreateCustomTheme = async () => {
    try {
      if (!customThemeData.title || !customThemeData.description) {
        toast({
          title: 'Champs requis',
          description: 'Veuillez remplir au moins le titre et la description',
          variant: 'destructive'
        });
        return;
      }
      
      // Préparation des mots-clés
      const keywords = customThemeData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      // TODO: Appel API pour créer le thème personnalisé
      toast({
        title: 'Génération en cours',
        description: 'Votre thème personnalisé est en cours de génération par l\'IA...',
      });
      
      // Fermer la boîte de dialogue
      setCustomThemeDialog(false);
      
      // Réinitialiser le formulaire
      setCustomThemeData({
        title: '',
        description: '',
        keywords: ''
      });
      
      // Actualiser les données après la création
      // await queryClient.invalidateQueries({ queryKey: ['/api/cyber-ascension/themes'] });
    } catch (error) {
      console.error('Erreur lors de la création du thème:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le thème personnalisé. Veuillez réessayer.',
        variant: 'destructive'
      });
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
        <p className="mb-6">Impossible de charger les thèmes CYBER ASCENSION.</p>
        <Button onClick={() => setLocation('/cyber')}>
          Retour à I AM CYBER
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <Link href="/cyber" className="inline-flex items-center text-white hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à I AM CYBER
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <Badge className="bg-blue-800/40 text-white border-blue-700/30 mb-6">
              Nouveau module
            </Badge>
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              CYBER ASCENSION
            </motion.h1>
            <motion.p 
              className="text-xl text-white mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Montez en compétence à travers 15 niveaux de difficulté progressive avec le contenu généré dynamiquement par l'IA pour un parcours d'apprentissage personnalisé.
            </motion.p>
            
            {progressData && (
              <motion.div
                className="space-y-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-sm text-white/70 mb-1">Niveau actuel</div>
                    <div className="text-2xl font-bold">Novice</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Total XP</div>
                    <div className="text-2xl font-bold">1,200 XP</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/70 mb-1">Niveaux complétés</div>
                    <div className="text-2xl font-bold">0 / 15</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <motion.div
              className="p-6 lg:p-12 bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.div 
                className="text-center space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                <Rocket className="h-24 w-24 mx-auto text-blue-50" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Progressez à votre rythme</h2>
                  <p className="text-blue-100">Choisissez votre thème et relevez les défis générés par l'IA</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 shadow-lg">
                    Commencer maintenant
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Thèmes disponibles</h2>
            <p className="text-gray-300">Choisissez un parcours pour développer vos compétences en cybersécurité</p>
          </div>
          
          <div className="flex gap-3">
            <Input 
              placeholder="Rechercher un thème..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-white/10 border-white/10 text-white placeholder:text-white/50"
            />
            <Dialog open={customThemeDialog} onOpenChange={setCustomThemeDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un thème
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Créer un thème personnalisé</DialogTitle>
                  <DialogDescription>
                    L'IA générera un thème sur mesure avec 15 niveaux de difficulté progressive.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="theme-title">Titre du thème</Label>
                    <Input 
                      id="theme-title" 
                      placeholder="Ex: Sécurité des systèmes embarqués" 
                      value={customThemeData.title}
                      onChange={(e) => setCustomThemeData({...customThemeData, title: e.target.value})}
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="theme-description">Description du thème</Label>
                    <Textarea 
                      id="theme-description" 
                      placeholder="Décrivez le thème que vous souhaitez explorer..." 
                      value={customThemeData.description}
                      onChange={(e) => setCustomThemeData({...customThemeData, description: e.target.value})}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="theme-keywords">Mots-clés (séparés par des virgules)</Label>
                    <Input 
                      id="theme-keywords" 
                      placeholder="Ex: IoT, microcontrôleurs, firmware" 
                      value={customThemeData.keywords}
                      onChange={(e) => setCustomThemeData({...customThemeData, keywords: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCustomThemeDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateCustomTheme}>
                    Générer le thème
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mb-8"
        >
          <TabsList className="bg-white/10 text-white">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20">Tous</TabsTrigger>
            <TabsTrigger value="inProgress" className="data-[state=active]:bg-white/20">En cours</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white/20">Terminés</TabsTrigger>
            <TabsTrigger value="notStarted" className="data-[state=active]:bg-white/20">Non commencés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-2 bg-gray-300 animate-pulse" />
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-6" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="flex items-center justify-between w-full">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {filteredThemes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredThemes.map((theme) => (
                      <ThemeCard key={theme.id} theme={theme} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Aucun thème trouvé</h3>
                    <p className="text-gray-400 mb-6">
                      {searchQuery 
                        ? `Aucun résultat pour "${searchQuery}"`
                        : "Aucun thème correspondant au filtre sélectionné"}
                    </p>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Réinitialiser la recherche
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="inProgress" className="mt-6">
            {/* Contenu identique mais filtré, déjà géré par filteredThemes */}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-6">
            {/* Contenu identique mais filtré, déjà géré par filteredThemes */}
          </TabsContent>
          
          <TabsContent value="notStarted" className="mt-6">
            {/* Contenu identique mais filtré, déjà géré par filteredThemes */}
          </TabsContent>
        </Tabs>
      </div>
      </ScrollArea>
    </div>
  );
}