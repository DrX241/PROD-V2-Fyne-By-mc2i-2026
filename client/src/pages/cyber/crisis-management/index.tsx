import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { IoMdArrowBack, IoMdTimer, IoMdNotifications } from 'react-icons/io';
import { BsExclamationCircleFill, BsShieldCheck, BsLightningCharge, BsPeopleFill, BsCalendarCheck } from 'react-icons/bs';
import { FiLock, FiUsers, FiServer, FiDatabase, FiGlobe, FiMessageSquare, FiArrowRight, FiPlay } from 'react-icons/fi';
import { RiRobot2Line, RiTeamLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function CrisisManagement() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableScenarios, setAvailableScenarios] = useState<any[]>([]);
  const [startingSession, setStartingSession] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  useEffect(() => {
    // Tester la connectivité d'abord
    testApiConnection();
    // Charger les scénarios disponibles
    fetchScenarios();
  }, []);
  
  // Fonction pour tester la connectivité à l'API
  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/crisis-management/test');
      const data = await response.json();
      console.log('API test response:', data);
      
      if (data.success) {
        console.log('API connection successful');
      } else {
        console.error('API test route returned error');
      }
    } catch (error) {
      console.error('Error testing API connection:', error);
    }
  };

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      // Utiliser fetch directement au lieu de apiRequest
      const response = await fetch('/api/crisis-management/scenarios');
      const data = await response.json();
      
      if (data.success) {
        setAvailableScenarios(data.scenarios);
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de charger les scénarios",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des scénarios:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setStartingSession(true);
    try {
      // Utilisation temporaire d'un ID de session simple pour la démo
      // Dans une implémentation réelle, cet ID viendrait du backend
      const demoSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
      
      setTimeout(() => {
        // Rediriger vers la page de session active
        navigate(`/cyber/crisis-management/session/${demoSessionId}`);
        
        toast({
          title: "Session démarrée",
          description: "Votre session de gestion de crise a été initialisée avec succès",
        });
      }, 1500); // Simuler un délai réseau
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setStartingSession(false);
      }, 1500); // Correspondre au délai ci-dessus
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setTimeout(() => {
      toast({
        title: "Merci pour votre intérêt !",
        description: "Vous serez notifié(e) des prochaines mises à jour du module.",
        duration: 5000,
      });
    }, 0);
  };

  const scenarios = [
    {
      id: 1,
      title: "Ransomware en cours",
      description: "Un ransomware se propage dans votre infrastructure critique",
      icon: <FiLock className="h-6 w-6 text-red-500" />,
      difficulty: "Expert",
      duration: "60 min"
    },
    {
      id: 2,
      title: "Compromission d'identités",
      description: "Détection d'activités suspectes sur plusieurs comptes VIP",
      icon: <FiUsers className="h-6 w-6 text-yellow-500" />,
      difficulty: "Avancé",
      duration: "45 min"
    },
    {
      id: 3,
      title: "Vulnérabilité Zero-Day",
      description: "Une faille critique est découverte sur vos serveurs exposés",
      icon: <FiServer className="h-6 w-6 text-orange-500" />,
      difficulty: "Expert",
      duration: "50 min"
    },
    {
      id: 4,
      title: "Exfiltration de données",
      description: "Détection d'un transfert massif de données sensibles",
      icon: <FiDatabase className="h-6 w-6 text-blue-500" />,
      difficulty: "Avancé",
      duration: "40 min"
    },
    {
      id: 5,
      title: "Attaque DDoS",
      description: "Vos services en ligne subissent une attaque par déni de service",
      icon: <FiGlobe className="h-6 w-6 text-purple-500" />,
      difficulty: "Intermédiaire",
      duration: "30 min"
    },
    {
      id: 6,
      title: "Communication de crise",
      description: "Gérer la communication interne et externe lors d'un incident majeur",
      icon: <FiMessageSquare className="h-6 w-6 text-green-500" />,
      difficulty: "Avancé",
      duration: "35 min"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-black text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header avec bouton retour */}
        <div className="flex items-center mb-8">
          <Link href="/cyber">
            <Button variant="ghost" className="text-white hover:bg-blue-800/30">
              <IoMdArrowBack className="mr-2 h-5 w-5" />
              Retour à I AM CYBER
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <BsExclamationCircleFill className="h-10 w-10 text-red-500" />
            <h1 className="text-4xl font-bold tracking-tight">GESTION DE CRISE</h1>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-500 mb-4">Disponible maintenant</Badge>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Mettez-vous dans la peau d'un RSSI confronté à des incidents majeurs et apprenez à gérer 
            efficacement une crise cybersécurité en temps réel.
          </p>
        </motion.div>

        {/* Section caractéristiques clés */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IoMdTimer className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-lg">Prise de décision rapide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Entraînez-vous à prendre des décisions stratégiques sous pression avec des contraintes de temps réelles.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RiTeamLine className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">Gestion d'équipe</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Dirigez une cellule de crise virtuelle et coordonnez les efforts de multiples équipes techniques et non-techniques.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BsLightningCharge className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">Scénarios réalistes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Affrontez des incidents inspirés de vraies crises cybersécurité documentées et analysées.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">IA dynamique</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                L'intelligence artificielle adapte les scénarios en fonction de vos décisions pour un défi personnalisé.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>

        {/* Aperçu de la progression */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-blue-950/50 rounded-lg border border-blue-800 p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <BsCalendarCheck className="mr-3 h-6 w-6 text-blue-400" />
              Progression du développement
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Conception des scénarios</p>
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500">Complété</Badge>
                </div>
                <Progress value={100} className="h-2 bg-blue-800/50" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Développement de l'IA adaptative</p>
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500">Complété</Badge>
                </div>
                <Progress value={100} className="h-2 bg-blue-800/50" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Intégration des simulations temps réel</p>
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500">Complété</Badge>
                </div>
                <Progress value={100} className="h-2 bg-blue-800/50" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Test et optimisation de l'expérience</p>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500">En cours</Badge>
                </div>
                <Progress value={75} className="h-2 bg-blue-800/50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scénarios disponibles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BsShieldCheck className="mr-3 h-6 w-6 text-blue-400" />
            Scénarios de crise disponibles au lancement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map(scenario => (
              <Card key={scenario.id} className="bg-blue-900/20 border-blue-800 backdrop-blur-sm transition-all hover:bg-blue-900/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      {scenario.icon}
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-500">
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-100 min-h-[60px]">
                    {scenario.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="flex items-center text-sm text-blue-300">
                    <IoMdTimer className="mr-1 h-4 w-4" />
                    {scenario.duration}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-sm h-8 bg-blue-800/20 hover:bg-blue-700/50"
                    onClick={() => startSession(scenario.id)}
                    disabled={startingSession || selectedScenarioId === scenario.id}
                  >
                    {startingSession && selectedScenarioId === scenario.id ? (
                      <>
                        <div className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-transparent animate-spin mr-1"></div>
                        Démarrage...
                      </>
                    ) : (
                      <>
                        <FiPlay className="mr-1 h-3 w-3" /> Démarrer la simulation
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-8 shadow-lg border border-blue-700"
        >
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <IoMdNotifications className="h-12 w-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Le défi de gestion de crise vous attend</h2>
            <p className="text-blue-100 mb-6">
              Notre module de Gestion de Crise est désormais disponible ! Testez vos compétences en 
              matière de prise de décision et de leadership face à des incidents de cybersécurité critiques.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Découvrir les scénarios
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blue-500 hover:bg-blue-800/30 text-white"
                onClick={handleSubscribe}
                disabled={isSubscribed}
              >
                {isSubscribed ? "Vous êtes inscrit(e) aux mises à jour" : "Recevoir les mises à jour"}
              </Button>
            </div>
          </div>
        </motion.div>
        
        <Separator className="my-12 bg-blue-800/50" />
        
        {/* Footer */}
        <div className="text-center text-blue-300 text-sm">
          <p>© 2025 Centre de Formation Cybersécurité • Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}