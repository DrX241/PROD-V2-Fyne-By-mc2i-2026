import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import { 
  Monitor, 
  Coffee, 
  Database, 
  Server, 
  ShieldAlert, 
  Users, 
  MessageSquare, 
  Cpu, 
  HardDrive, 
  TerminalSquare, 
  KeyRound, 
  AlertCircle, 
  ChevronRight
} from 'lucide-react';

const Headquarters: React.FC = () => {
  const { player } = useCyberQuest();
  const [selectedArea, setSelectedArea] = useState<string>('command-center');
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<{
    title: string;
    description: string;
    content: string;
  }>({
    title: '',
    description: '',
    content: ''
  });
  
  // Ouvrir une boîte de dialogue avec les détails d'une zone
  const openAreaDetails = (title: string, description: string, content: string) => {
    setDialogData({
      title,
      description,
      content
    });
    setShowDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-900/20 border-blue-500">
        <ShieldAlert className="h-4 w-4 text-blue-500" />
        <AlertTitle>Bienvenue au Quartier Général de CyberQuest</AlertTitle>
        <AlertDescription>
          Ce centre d'opérations vous permet d'accéder à toutes les ressources et zones d'entraînement.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="command-center" value={selectedArea} onValueChange={setSelectedArea} className="w-full">
        <TabsList className="w-full bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="command-center" className="flex items-center">
            <Monitor className="h-4 w-4 mr-2" /> Centre de contrôle
          </TabsTrigger>
          <TabsTrigger value="training-area" className="flex items-center">
            <Cpu className="h-4 w-4 mr-2" /> Zone d'entraînement
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center">
            <Database className="h-4 w-4 mr-2" /> Laboratoires
          </TabsTrigger>
          <TabsTrigger value="lounge" className="flex items-center">
            <Coffee className="h-4 w-4 mr-2" /> Espace détente
          </TabsTrigger>
        </TabsList>
        
        {/* Centre de contrôle */}
        <TabsContent value="command-center" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Salle des opérations', 
                'Le cœur névralgique du quartier général',
                'La salle des opérations centralise toutes les informations sur les menaces cybernétiques en cours. Les grands écrans muraux affichent des cartes du monde en temps réel avec des points chauds d'activité malveillante. Des analystes travaillent 24/7 pour surveiller les incidents et coordonner les équipes d\'intervention.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Salle des opérations</CardTitle>
                  <Monitor className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Le cœur névralgique du quartier général</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Grand écran de suivi des menaces et tableaux de bord des incidents en cours.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Centre de briefing', 
                'Coordination des missions et assignation d\'équipe',
                'Le centre de briefing est équipé d\'une grande table holographique permettant d\'afficher des modèles 3D de sites potentiellement compromis. Les chefs d\'équipe utilisent cet espace pour préparer les agents avant leur déploiement, avec tous les détails tactiques et techniques nécessaires à la mission.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Centre de briefing</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Coordination des missions et équipes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Salle de réunion équipée de projecteurs holographiques et tableaux tactiques.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Centre de sécurité', 
                'Surveillance et défense contre les intrusions',
                'Le centre de sécurité contient les systèmes avancés de détection d\'intrusion et de surveillance du réseau. Des ingénieurs spécialisés analysent les tentatives d\'attaque et renforcent continuellement les défenses du quartier général. Ce centre abrite également les serveurs de gestion des accès et d\'authentification du personnel.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Centre de sécurité</CardTitle>
                  <ShieldAlert className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Surveillance et défense</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Systèmes avancés de détection d'intrusion et contrôle d'accès.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Centre de communications', 
                'Réseau global d\'échange d\'informations',
                'Le centre de communications maintient des lignes cryptées avec toutes les agences partenaires et les équipes sur le terrain. Des spécialistes en télécommunications sécurisées garantissent que toutes les transmissions restent privées et protégées contre l\'interception. Ce centre abrite également le système de messagerie interne hautement sécurisé.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Centre de communications</CardTitle>
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Réseau global d'échange d'informations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Systèmes de communication cryptés et gestion des transmissions sécurisées.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transmissions récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">Urgent</Badge>
                  <span>Alerte de sécurité niveau 3 détectée dans le secteur financier</span>
                </div>
                <span className="text-gray-500 text-xs">il y a 12 min</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">Info</Badge>
                  <span>Mise à jour des définitions de malware complétée</span>
                </div>
                <span className="text-gray-500 text-xs">il y a 47 min</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mr-2">Succès</Badge>
                  <span>L'Agent Martinez a complété sa mission de récupération de données</span>
                </div>
                <span className="text-gray-500 text-xs">il y a 1h</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Zone d'entraînement */}
        <TabsContent value="training-area" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Simulateur d\'infiltration', 
                'Entraînement aux techniques d\'accès physique',
                'Le simulateur d\'infiltration recrée des environnements physiques variés, des bureaux d\'entreprise aux datacenters sécurisés. Les agents s\'entraînent à contourner différents types de contrôles d\'accès, depuis les serrures mécaniques jusqu\'aux systèmes biométriques avancés. Différents scénarios sont disponibles, avec des niveaux de difficulté croissants.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Simulateur d'infiltration</CardTitle>
                  <KeyRound className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Techniques d'accès physique</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Environnements recréés pour pratiquer les méthodes d'infiltration sécurisée.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 3+ requis</Badge>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Laboratoire d\'exploitation', 
                'Découverte et exploitation de vulnérabilités',
                'Le laboratoire d\'exploitation contient des systèmes informatiques de toutes générations sur lesquels les agents peuvent pratiquer leurs compétences en découverte de vulnérabilités. Des environnements virtuels isolés permettent de tester des exploits sans risque. Des compétitions régulières entre agents permettent de garder les compétences affûtées.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Laboratoire d'exploitation</CardTitle>
                  <TerminalSquare className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Découverte de vulnérabilités</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Environnement isolé pour tester et développer des techniques d'exploitation.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 2+ requis</Badge>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Salle d\'analyse forensique', 
                'Investigation numérique post-incident',
                'La salle d\'analyse forensique est équipée d\'outils spécialisés pour récupérer et analyser des données à partir de dispositifs compromis. Les agents apprennent à extraire des preuves numériques tout en préservant leur intégrité pour une utilisation légale. Des workshops réguliers permettent de se tenir au courant des dernières techniques.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Salle d'analyse forensique</CardTitle>
                  <HardDrive className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Investigation numérique</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Équipement spécialisé pour la récupération et l'analyse de données.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Salle de crise', 
                'Gestion d\'incident et réponse coordonnée',
                'La salle de crise est conçue pour simuler des incidents cybernétiques majeurs nécessitant une réponse coordonnée. Les agents s\'entraînent à communiquer efficacement sous pression et à suivre les procédures d\'urgence établies. Des scénarios inspirés d\'incidents réels permettent de se préparer à toute éventualité.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Salle de crise</CardTitle>
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Gestion d'incident</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Simulations d'incidents critiques et entraînement à la gestion de crise.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 5+ requis</Badge>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Laboratoires */}
        <TabsContent value="labs" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Laboratoire de malware', 
                'Analyse et rétro-ingénierie de logiciels malveillants',
                'Le laboratoire de malware est hermétiquement isolé du reste du réseau et permet l\'étude sécurisée de logiciels malveillants. Des postes de travail spécialisés permettent de décompiler et analyser le code des malwares pour comprendre leurs mécanismes et développer des contre-mesures efficaces.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Laboratoire de malware</CardTitle>
                  <Server className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Analyse de logiciels malveillants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Environnement isolé pour l'étude sécurisée et la rétro-ingénierie de malwares.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 4+ requis</Badge>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Centre de cryptographie', 
                'Recherche en cryptanalyse et sécurité des communications',
                'Le centre de cryptographie abrite des supercalculateurs dédiés à la recherche en cryptanalyse. Les agents spécialisés développent et testent de nouveaux algorithmes de chiffrement tout en cherchant des faiblesses dans les protocoles existants. Un laboratoire de clés physiques permet également l\'étude des tokens d\'authentification matériels.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Centre de cryptographie</CardTitle>
                  <KeyRound className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Recherche en cryptanalyse</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Développement et analyse de systèmes cryptographiques avancés.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 6+ requis</Badge>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Laboratoire IoT', 
                'Recherche sur la sécurité des objets connectés',
                'Le laboratoire IoT contient une vaste collection d\'appareils connectés, des plus communs aux plus spécialisés. Les chercheurs testent la sécurité de ces appareils, documentent les vulnérabilités et développent des méthodes pour sécuriser l\'écosystème IoT en pleine expansion.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Laboratoire IoT</CardTitle>
                  <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Sécurité des objets connectés</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Recherche sur les vulnérabilités des appareils connectés modernes.</p>
              </CardContent>
              <CardFooter>
                <Badge className="bg-gray-700">Niveau 3+ requis</Badge>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Centre de développement', 
                'Création d\'outils de cybersécurité personnalisés',
                'Le centre de développement est où les ingénieurs conçoivent les outils propriétaires utilisés sur le terrain. Des environnements de développement intégrés permettent de programmer dans tous les langages courants, et des systèmes de test automatisés garantissent la qualité des outils avant leur déploiement.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Centre de développement</CardTitle>
                  <TerminalSquare className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Outils de cybersécurité</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Conception et programmation d'applications et utilitaires spécialisés.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Espace détente */}
        <TabsContent value="lounge" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Cafétéria', 
                'Restauration et pause pour les agents',
                'La cafétéria offre des repas 24/7 pour les équipes travaillant à toute heure. Le menu est conçu par des nutritionnistes pour maximiser les performances cognitives, et le café est considéré par beaucoup comme le meilleur de la ville. C\'est aussi un lieu de socialisation important où les agents partagent informellement des connaissances.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Cafétéria</CardTitle>
                  <Coffee className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Restauration et pause</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Espace de restauration ouvert 24/7 avec cuisine complète.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Salle de fitness', 
                'Maintien de la condition physique',
                'La salle de fitness est équipée pour le cardio, la musculation et les arts martiaux. Des entraîneurs professionnels sont disponibles sur rendez-vous, et des cours collectifs de self-défense sont organisés régulièrement. Le maintien d\'une bonne condition physique est considéré comme essentiel pour la résistance au stress.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Salle de fitness</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Maintien de la condition physique</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Équipement d'entraînement complet et zone d'exercices guidés.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Bibliothèque technique', 
                'Ressources de recherche et documentation',
                'La bibliothèque contient une vaste collection de livres, de journaux et d\'accès à des bases de données spécialisées. Du matériel historique sur la cryptographie côtoie les dernières publications en cybersécurité. Des espaces d\'étude privés permettent de se concentrer sur des recherches approfondies dans un environnement calme.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Bibliothèque technique</CardTitle>
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Ressources et documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Accès à des ressources techniques et références spécialisées.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => openAreaDetails(
                'Espace créatif', 
                'Détente et stimulation de la pensée latérale',
                'L\'espace créatif offre un environnement moins formel pour stimuler la pensée latérale et la résolution de problèmes. Des jeux de société stratégiques, des puzzles complexes et des équipements artistiques sont disponibles. Beaucoup de percées techniques ont eu leur origine dans cet espace conçu pour sortir des schémas de pensée habituels.'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Espace créatif</CardTitle>
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <CardDescription>Détente et pensée latérale</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Zone de décompression avec jeux de réflexion et activités créatives.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <ChevronRight className="h-4 w-4 mr-1" /> Accéder
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialogue de détails */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogData.title}</DialogTitle>
            <DialogDescription>
              {dialogData.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="leading-relaxed">{dialogData.content}</p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Headquarters;