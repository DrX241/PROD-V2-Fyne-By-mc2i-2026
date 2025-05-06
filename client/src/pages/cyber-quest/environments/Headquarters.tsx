import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { useCyberQuest } from '@/contexts/CyberQuestContext';
import {
  Monitor,
  Server,
  Coffee,
  Briefcase,
  Book,
  Users,
  ShieldCheck,
  Network,
  LayoutGrid,
  MessageSquare,
  Lock,
  AlertCircle,
  InfoIcon,
} from 'lucide-react';

const Headquarters: React.FC = () => {
  const { player, addExperience } = useCyberQuest();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  
  // Simuler une action dans la zone sélectionnée
  const handleZoneAction = async (action: string) => {
    setIsPerformingAction(true);
    
    try {
      // Dans une implémentation complète, nous enverrions une demande au serveur
      // Pour l'instant, nous simulerons une réponse avec un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simuler l'ajout d'expérience
      const xpGained = Math.floor(Math.random() * 20) + 10;
      await addExperience(xpGained);
      
      toast({
        title: "Action réussie",
        description: `Vous avez effectué l'action "${action}" et gagné ${xpGained} XP.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'exécution de cette action.",
        variant: "destructive",
      });
    } finally {
      setIsPerformingAction(false);
    }
  };
  
  // Définition des zones du quartier général
  const zones = [
    {
      id: 'command-center',
      name: 'Centre de Commandement',
      description: 'Centre névralgique des opérations et coordination des agents.',
      icon: <Monitor size={24} />,
      color: 'bg-blue-500',
      actions: [
        { id: 'check-missions', name: 'Consulter le tableau de missions', description: 'Vérifiez les missions disponibles et leur priorité' },
        { id: 'attend-briefing', name: 'Assister à un briefing', description: 'Participez à une session d\'information sur les menaces actuelles' },
      ]
    },
    {
      id: 'server-room',
      name: 'Salle des Serveurs',
      description: 'Infrastructure centrale de données et de systèmes sécurisés.',
      icon: <Server size={24} />,
      color: 'bg-indigo-500',
      actions: [
        { id: 'system-monitoring', name: 'Surveiller les systèmes', description: 'Vérifiez l\'état des systèmes et les journaux d\'événements' },
        { id: 'patch-systems', name: 'Appliquer des correctifs', description: 'Mettez à jour les systèmes avec les derniers correctifs de sécurité' },
      ]
    },
    {
      id: 'training-room',
      name: 'Salle d\'Entraînement',
      description: 'Espace dédié à l\'amélioration des compétences techniques.',
      icon: <Book size={24} />,
      color: 'bg-green-500',
      actions: [
        { id: 'technical-training', name: 'Formation technique', description: 'Améliorez vos compétences techniques en cybersécurité' },
        { id: 'hacking-simulation', name: 'Simulation de piratage', description: 'Pratiquez vos compétences d\'attaque dans un environnement contrôlé' },
      ]
    },
    {
      id: 'laboratory',
      name: 'Laboratoire',
      description: 'Zone d\'analyse de malwares et de recherche en cybersécurité.',
      icon: <ShieldCheck size={24} />,
      color: 'bg-amber-500',
      actions: [
        { id: 'malware-analysis', name: 'Analyser un malware', description: 'Effectuez une analyse approfondie d\'un échantillon de malware' },
        { id: 'develop-tools', name: 'Développer des outils', description: 'Créez ou améliorez des outils de cybersécurité' },
      ]
    },
    {
      id: 'briefing-room',
      name: 'Salle de Briefing',
      description: 'Espace de planification des opérations et partage d\'informations.',
      icon: <Briefcase size={24} />,
      color: 'bg-red-500',
      actions: [
        { id: 'mission-planning', name: 'Planification de mission', description: 'Préparez une stratégie pour une mission à venir' },
        { id: 'intel-sharing', name: 'Partage de renseignements', description: 'Échangez des informations avec d\'autres agents' },
      ]
    },
    {
      id: 'lounge',
      name: 'Salon',
      description: 'Espace de détente pour les agents entre les missions.',
      icon: <Coffee size={24} />,
      color: 'bg-purple-500',
      actions: [
        { id: 'rest', name: 'Se reposer', description: 'Récupérez de l\'énergie entre les missions' },
        { id: 'socialize', name: 'Socialiser', description: 'Discutez avec d\'autres agents pour améliorer vos relations' },
      ]
    },
    {
      id: 'network-ops',
      name: 'Centre d\'Opérations Réseau',
      description: 'Surveillance et gestion des infrastructures réseau.',
      icon: <Network size={24} />,
      color: 'bg-teal-500',
      actions: [
        { id: 'monitor-traffic', name: 'Surveiller le trafic', description: 'Analysez le trafic réseau pour détecter des anomalies' },
        { id: 'enhance-security', name: 'Renforcer la sécurité', description: 'Configurez des mesures de sécurité réseau supplémentaires' },
      ]
    },
    {
      id: 'crypto-room',
      name: 'Salle de Cryptographie',
      description: 'Développement et analyse des systèmes cryptographiques.',
      icon: <Lock size={24} />,
      color: 'bg-gray-700',
      actions: [
        { id: 'decrypt-data', name: 'Décrypter des données', description: 'Tentez de déchiffrer des données cryptées' },
        { id: 'develop-crypto', name: 'Développer des algorithmes', description: 'Créez ou améliorez des systèmes de chiffrement' },
      ]
    },
    {
      id: 'soc',
      name: 'Centre des Opérations de Sécurité',
      description: 'Surveillance continue des menaces et réponse aux incidents.',
      icon: <AlertCircle size={24} />,
      color: 'bg-orange-500',
      actions: [
        { id: 'analyze-alerts', name: 'Analyser les alertes', description: 'Triez et analysez les alertes de sécurité' },
        { id: 'incident-response', name: 'Réponse aux incidents', description: 'Participez à une simulation de réponse à incident' },
      ]
    }
  ];
  
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Quartier Général de l'Agence</h2>
        <p className="text-gray-500">
          Bienvenue dans le quartier général, Agent{player?.characterName ? ` ${player.characterName}` : ''}. 
          Ici, vous pouvez accéder à différentes zones pour effectuer des actions, 
          consulter des informations, ou interagir avec d'autres agents.
        </p>
      </div>
      
      {/* Grille des zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <Card 
            key={zone.id} 
            className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
            style={{ borderLeftColor: zone.color }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${zone.color} text-white`}>
                  {zone.icon}
                </div>
                <CardTitle className="text-lg">{zone.name}</CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
                {zone.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setSelectedZone(zone.id)}>
                    Entrer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-3 rounded-full ${zone.color} text-white`}>
                        {zone.icon}
                      </div>
                      <DialogTitle className="text-xl">{zone.name}</DialogTitle>
                    </div>
                    <p className="text-gray-500 mt-2">
                      {zone.description}
                    </p>
                  </DialogHeader>
                  
                  <div className="my-4">
                    <h4 className="text-sm font-medium mb-3">Actions disponibles</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {zone.actions.map((action) => (
                        <Card key={action.id} className="border-gray-200 hover:border-gray-300">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{action.name}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleZoneAction(action.name)}
                              disabled={isPerformingAction}
                            >
                              {isPerformingAction ? 'En cours...' : 'Effectuer cette action'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedZone(null)}>
                      Retour
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Statut du QG */}
      <Card className="bg-gray-50 dark:bg-gray-800 mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
            Statut du Quartier Général
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Niveau d'alerte: Normal
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Personnel: 42 agents
            </Badge>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              Missions actives: 8
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Headquarters;