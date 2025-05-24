import React from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowRight, 
  ChevronLeft, 
  Code,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { BsFileEarmarkCode } from 'react-icons/bs';

const DataIaRoleplay: React.FC = () => {
  const [, setLocation] = useLocation();

  // Animation des cartes
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }
  };

  // Liste des scénarios de jeu de rôle
  const scenarios = [
    {
      id: 'consultant-data',
      title: "Je suis Consultant Data & IA",
      description: "Je teste mes compétences à travers des QCM",
      link: '/data-ia/roleplay/read-me-if-you-can',
      icon: <Code className="h-10 w-10 text-indigo-200" />,
      color: 'indigo',
      gradient: 'from-indigo-900/70 to-indigo-700/30',
      border: 'border-indigo-500/30',
      buttonGradient: 'from-indigo-700 to-indigo-600',
      buttonHover: 'hover:from-indigo-600 hover:to-indigo-500',
      textColor: 'text-indigo-300',
      details: [
        "Analyse de code Python et SQL",
        "QCM techniques et explicatifs",
        "Progression par niveaux de difficulté"
      ],
      comingSoon: false
    },
    {
      id: 'data-scientist',
      title: "Je suis Data Scientist",
      description: "Je crée et teste des algorithmes d'analyse",
      link: '/data-ia/roleplay/ia-lab-trainer',
      icon: <BsFileEarmarkCode className="h-10 w-10 text-blue-200" />,
      color: 'blue',
      gradient: 'from-blue-900/70 to-blue-700/30',
      border: 'border-blue-500/30',
      buttonGradient: 'from-blue-700 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-500',
      textColor: 'text-blue-300',
      details: [
        "Laboratoire de code interactif",
        "Assistance IA pour l'analyse",
        "Environnement Python et SQL"
      ],
      comingSoon: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white relative pb-20">
      <Helmet>
        <title>DATA & IA ROLE PLAY | Simulations immersives</title>
      </Helmet>
      
      {/* Arrière-plan statique */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-indigo-900/30 z-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/20 to-blue-900/30 z-5"></div>
      </div>
      
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-indigo-800 text-indigo-400 hover:bg-black/70 hover:text-indigo-300 hover:border-indigo-500 transition-colors"
          onClick={() => setLocation('/data-ia')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      {/* En-tête */}
      <div className="pt-16 pb-10 text-center relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-400 mb-4">
          DATA & IA ROLE PLAY
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg px-4">
          Développez vos compétences en analyse de données et algorithmes à travers 
          des environnements interactifs spécialement conçus pour les profils Data & IA.
        </p>
      </div>

      {/* Liste des scénarios */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="h-full"
          >
            <Card className={`h-full bg-gradient-to-br ${scenario.gradient} ${scenario.border} hover:border-${scenario.color}-500/50 hover:shadow-lg transition-all duration-300`}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-${scenario.color}-800/70`}>
                    {scenario.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">{scenario.title}</CardTitle>
                <CardDescription className={`${scenario.textColor} text-center text-lg`}>
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className={`mb-6 ${scenario.textColor}`}>
                  {scenario.id === 'consultant-data' 
                    ? "Analysez du code Python et SQL pour résoudre des problèmes d'analyse de données complexes et testez vos connaissances techniques."
                    : "Développez et testez des algorithmes dans un environnement interactif avec assistance IA pour améliorer vos compétences pratiques."}
                </p>
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  {scenario.details.map((detail, i) => (
                    <li key={i} className={`flex items-center ${scenario.textColor}`}>
                      <div className={`h-2 w-2 rounded-full bg-${scenario.color}-400 mr-2`}></div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className={`w-full py-6 bg-gradient-to-r ${scenario.buttonGradient} ${scenario.buttonHover} text-white group`}
                  onClick={() => setLocation(scenario.link)}
                  disabled={scenario.comingSoon}
                >
                  <span className="flex items-center">
                    {scenario.comingSoon ? "Bientôt disponible" : (
                      <>
                        {scenario.id === 'consultant-data' ? "Commencer le défi" : "Accéder au laboratoire"}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Note en bas de page */}
      <div className="text-center text-gray-500 mt-12 text-sm relative z-10">
        <p>Les environnements sont conçus pour offrir une expérience d'apprentissage dynamique et personnalisée.</p>
      </div>
    </div>
  );
};

export default DataIaRoleplay;