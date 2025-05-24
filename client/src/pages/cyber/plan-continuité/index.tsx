import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { IoMdArrowBack, IoMdTimer, IoMdNotifications, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { BsShieldCheck, BsGearFill, BsCheckCircleFill, BsClipboardCheck, BsCalendarCheck, BsListCheck } from 'react-icons/bs';
import { FiUsers, FiServer, FiAlertTriangle, FiCheckCircle, FiTarget, FiClipboard } from 'react-icons/fi';
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

export default function PlanContinuiteActivite() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setTimeout(() => {
      toast({
        title: "Merci pour votre intérêt !",
        description: "Vous serez notifié(e) dès que le module sera disponible.",
        duration: 5000,
      });
    }, 0);
  };

  const pcaElements = [
    {
      id: 1,
      title: "Analyse d'impact",
      description: "Identifier et prioriser les processus critiques et leurs dépendances",
      icon: <FiTarget className="h-6 w-6 text-blue-500" />,
      difficulty: "Intermédiaire",
      duration: "30 min"
    },
    {
      id: 2,
      title: "Stratégies de reprise",
      description: "Définir les méthodes et solutions pour assurer la continuité des activités",
      icon: <BsGearFill className="h-6 w-6 text-green-500" />,
      difficulty: "Intermédiaire",
      duration: "25 min"
    },
    {
      id: 3,
      title: "Analyses de risques",
      description: "Identifier et évaluer les menaces potentielles sur les activités critiques",
      icon: <FiAlertTriangle className="h-6 w-6 text-yellow-500" />,
      difficulty: "Avancé",
      duration: "35 min"
    },
    {
      id: 4,
      title: "Procédures opérationnelles",
      description: "Développer des procédures détaillées pour le maintien et la reprise d'activité",
      icon: <FiClipboard className="h-6 w-6 text-indigo-500" />,
      difficulty: "Intermédiaire",
      duration: "40 min"
    },
    {
      id: 5,
      title: "Organisation et rôles",
      description: "Définir la gouvernance et les responsabilités en cas d'activation du PCA",
      icon: <FiUsers className="h-6 w-6 text-purple-500" />,
      difficulty: "Débutant",
      duration: "20 min"
    },
    {
      id: 6,
      title: "Tests et exercices",
      description: "Planifier et exécuter des simulations pour valider l'efficacité du PCA",
      icon: <BsCheckCircleFill className="h-6 w-6 text-red-500" />,
      difficulty: "Avancé",
      duration: "45 min"
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
            <BsShieldCheck className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold tracking-tight">PLAN DE CONTINUITÉ D'ACTIVITÉ (PCA)</h1>
          </div>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400 mb-4">Disponible prochainement</Badge>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Apprenez à concevoir, déployer et tester un Plan de Continuité d'Activité efficace pour garantir 
            la résilience de votre organisation face aux incidents cyber et autres perturbations.
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
                <BsClipboardCheck className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-lg">Méthodologie complète</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Maîtrisez chaque étape du processus PCA selon les standards internationaux (ISO 22301, NIST).
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BsListCheck className="h-6 w-6 text-green-400" />
                <CardTitle className="text-lg">Modèles et templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Accédez à des templates prêts à l'emploi pour accélérer la création de votre PCA et faciliter sa mise en œuvre.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RiTeamLine className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-lg">Dimension humaine</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Intégrez les facteurs humains et organisationnels pour un PCA réaliste et adapté à la culture de votre entreprise.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/30 border-blue-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="h-6 w-6 text-purple-400" />
                <CardTitle className="text-lg">Assistant IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-100">
                Bénéficiez de l'aide d'un assistant IA qui vous guide et analyse vos décisions tout au long de l'élaboration de votre PCA.
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
                  <p className="font-medium">Référentiel méthodologique</p>
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-500">Complété</Badge>
                </div>
                <Progress value={100} className="h-2 bg-blue-800/50" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Création des templates et modèles</p>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500">En cours</Badge>
                </div>
                <Progress value={75} className="h-2 bg-blue-800/50" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Développement des cas pratiques</p>
                  <Badge variant="outline" className="bg-yellow-900/30 text-yellow-400 border-yellow-500">En planification</Badge>
                </div>
                <Progress value={40} className="h-2 bg-blue-800/50" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Intégration de l'assistant IA</p>
                  <Badge variant="outline" className="bg-gray-800/30 text-gray-400 border-gray-600">À venir</Badge>
                </div>
                <Progress value={15} className="h-2 bg-blue-800/50" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Éléments du PCA disponibles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <BsShieldCheck className="mr-3 h-6 w-6 text-blue-400" />
            Éléments du PCA couverts dans le module
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pcaElements.map(element => (
              <Card key={element.id} className="bg-blue-900/20 border-blue-800 backdrop-blur-sm transition-all hover:bg-blue-900/30">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      {element.icon}
                      <CardTitle className="text-lg">{element.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs text-blue-300 border-blue-500">
                      {element.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-100 min-h-[60px]">
                    {element.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="flex items-center text-sm text-blue-300">
                    <IoMdTimer className="mr-1 h-4 w-4" />
                    {element.duration}
                  </div>
                  <Button variant="ghost" disabled className="text-sm h-8 bg-blue-800/20">
                    <FiCheckCircle className="mr-1 h-3 w-3" /> Bientôt disponible
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
            <h2 className="text-2xl font-bold mb-4">Préparez-vous à renforcer la résilience de votre organisation</h2>
            <p className="text-blue-100 mb-6">
              Recevez une notification dès que le module PCA sera disponible.
              Vous pourrez alors acquérir toutes les compétences nécessaires pour développer et maintenir
              un Plan de Continuité d'Activité efficace et adapté à votre contexte.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white border-none"
                onClick={handleSubscribe}
                disabled={isSubscribed}
              >
                {isSubscribed ? "Vous êtes inscrit(e) !" : "Être notifié(e) au lancement"}
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