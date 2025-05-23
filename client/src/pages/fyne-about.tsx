import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Brain, Sparkles, BookOpen, Target, Users, CheckCircle, Zap, Clock, BookOpenCheck, GitPullRequest, BarChart4, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import CyberButton from '@/components/CyberButton';

// Utilisation de CSS pour le fond au lieu d'une image lourde
// L'image sera chargée de manière progressive et optimisée

export default function FyneAbout() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Technologies avancées
  const technologies = [
    {
      title: "IA Prédictive",
      description: "Algorithmes avancés s'adaptant en temps réel à votre niveau et vos besoins spécifiques.",
      icon: <Target className="h-10 w-10 text-blue-400" />,
      color: "from-blue-950 to-blue-900/60 border-blue-800/50"
    },
    {
      title: "Simulations Immersives",
      description: "Scénarios réalistes et adaptatifs avec feedback personnalisé et évolution dynamique.",
      icon: <Shield className="h-10 w-10 text-blue-400" />,
      color: "from-blue-950 to-blue-900/60 border-blue-800/50"
    },
    {
      title: "Environnement Interactif",
      description: "Interfaces multi-sensorielles conçues pour maximiser l'engagement et l'apprentissage.",
      icon: <Brain className="h-10 w-10 text-blue-400" />,
      color: "from-blue-950 to-blue-900/60 border-blue-800/50"
    },
  ];
  
  // Caractéristiques de la plateforme
  const features = [
    {
      title: "Personnages IA avancés",
      description: "Interagissez avec des PNJ ultra-réalistes qui s'adaptent à votre style d'apprentissage.",
      icon: <Users className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
    {
      title: "Apprentissage adaptatif",
      description: "Algorithmes d'IA qui ajustent la difficulté et le contenu selon votre progression.",
      icon: <GitPullRequest className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
    {
      title: "Scénarios contextuels",
      description: "Simulation de situations professionnelles réelles pour un apprentissage applicable.",
      icon: <BookOpenCheck className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
    {
      title: "Feedback instantané",
      description: "Évaluation continue et suggestions d'amélioration par l'intelligence artificielle.",
      icon: <Zap className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
    {
      title: "Modules sectoriels",
      description: "Contenus spécialisés adaptés aux enjeux spécifiques de votre industrie.",
      icon: <BarChart4 className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
    {
      title: "Accessibilité totale",
      description: "Disponible sur tous vos appareils avec synchronisation automatique.",
      icon: <HeartHandshake className="h-10 w-10 text-indigo-400" />,
      color: "from-indigo-950 to-indigo-900/60 border-indigo-800/50"
    },
  ];

  // Les problèmes de formation traditionnelle et les solutions FYNE
  const challenges = [
    { 
      challenge: "Rétention d'information limitée à 20% avec les méthodes classiques",
      solution: "Amélioration à plus de 75% grâce à l'apprentissage par l'expérience",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    },
    { 
      challenge: "Manque d'engagement et d'attention durant les formations traditionnelles",
      solution: "Engagement actif grâce à l'interaction continue et aux simulations immersives",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    },
    { 
      challenge: "Absence de mise en pratique concrète des connaissances acquises",
      solution: "Application directe dans des environnements simulés reproduisant des cas réels",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    },
    { 
      challenge: "Difficulté à personnaliser le contenu selon les besoins individuels",
      solution: "Adaptation automatique du contenu et de la difficulté à chaque utilisateur",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    },
    { 
      challenge: "Mesure inefficace des progrès et des compétences réellement acquises",
      solution: "Analyse détaillée des performances avec métriques concrètes et actionables",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    },
    { 
      challenge: "Contraintes de temps et de lieu limitant l'accès à la formation",
      solution: "Flexibilité totale permettant l'apprentissage n'importe où, n'importe quand",
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      {/* Hero section with background image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        {/* Fond optimisé avec dégradé CSS pour un chargement instantané */}
        <div className="absolute inset-0 w-full h-full bg-black/40 z-10"></div>
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 animate-pulse-slow"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: `
              radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), 
              radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
              linear-gradient(60deg, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
              repeating-linear-gradient(45deg, rgba(30, 64, 175, 0.05) 0%, rgba(30, 64, 175, 0.05) 2px, transparent 2px, transparent 8px),
              radial-gradient(circle at 20% 20%, rgba(147, 197, 253, 0.15) 0%, transparent 40%)
            `
          }}
        ></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-20">
          <Link href="/">
            <Button variant="ghost" className="absolute top-6 left-6 text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez <span className="text-blue-400">FYNE</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              L'expérience de formation immersive nouvelle génération qui transforme radicalement l'apprentissage professionnel
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        {/* Technologies avancées section */}
        <motion.section
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-block px-4 py-1.5 bg-blue-600/30 rounded-full text-blue-200 mb-4 mx-auto">
            <span className="text-sm">Technologie Propriétaire</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Avancées <span className="bg-gradient-to-r from-pink-400 to-pink-600 text-transparent bg-clip-text">Technologiques</span>
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto text-center">
            Une infrastructure numérique conçue pour propulser votre apprentissage vers de nouveaux horizons
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`bg-gradient-to-br ${tech.color} h-full border-[1px] hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300`}>
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {tech.icon}
                    </div>
                    <CardTitle className="text-xl text-center text-blue-100">{tech.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-center">
                      {tech.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Citation section */}
        <motion.section 
          className="mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="bg-blue-50/5 rounded-lg p-8 md:p-10 text-center relative">
            <div className="text-6xl text-blue-400/30 absolute top-6 left-6">❝</div>
            <p className="text-xl md:text-2xl text-gray-200 italic mb-6 relative z-10">
              "L'intelligence artificielle ne remplace pas l'intelligence humaine, elle l'augmente. Notre plateforme combine le meilleur des deux pour créer une expérience d'apprentissage inégalée."
            </p>
            <div className="text-blue-400">
              Direction de l'Innovation
              <span className="block text-sm text-gray-400">mc2i</span>
            </div>
          </div>
        </motion.section>

        {/* Une expérience d'apprentissage inégalée section */}
        <motion.section
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-block px-4 py-1.5 bg-blue-600/30 rounded-full text-blue-200 mb-4 mx-auto">
            <span className="text-sm">Technologies avancées</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Une expérience d'apprentissage <span className="text-blue-400">inégalée</span>
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto text-center">
            Notre technologie d'IA générative crée un environnement personnalisé qui s'adapte à vos besoins
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`bg-white bg-opacity-5 border-[1px] border-white/10 h-full hover:bg-opacity-10 hover:border-indigo-500/30 transition-all duration-300`}>
                  <CardHeader>
                    <div className="mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Défis et solutions section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            Pourquoi <span className="text-blue-400">FYNE</span> révolutionne la formation
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto text-center">
            Nos solutions répondent aux défis majeurs des méthodes d'apprentissage traditionnelles
          </p>
          
          <div className="max-w-4xl mx-auto">
            {challenges.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/20 rounded-lg p-5 mb-4"
              >
                <div className="flex items-start">
                  <div className="bg-red-500/20 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-300 mb-1">Défi</h3>
                    <p className="text-gray-300 mb-4">{item.challenge}</p>
                    
                    <div className="flex items-start">
                      <div className="bg-emerald-500/20 rounded-full p-3 mr-4">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-300 mb-1">Solution FYNE</h3>
                        <p className="text-gray-300">{item.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Histoire de FYNE section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-emerald-400">🌱</span> D'où vient FYNE ?
          </h2>
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/30 rounded-lg p-8">
            <p className="text-gray-200 mb-6">
              Issu d'un challenge intrapreneurial mc2i lancé en 2024, FYNE a été développé par 4 collaborateurs mêlant expertises en cybersécurité, formation, IA générative et développement.
            </p>
            <p className="text-gray-200 mb-6">
              En quelques semaines un premier prototype opérationnel a été créé. Il est testé immédiatement en interne chez mc2i, dans des contextes concrets :
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-300">
              <li>Simulations cyber pour des consultants</li>
              <li>Tests de mise en situation pour recruter des profils spécialisés</li>
              <li>Entraînement express avant une soutenance client</li>
            </ul>
            <p className="text-gray-200 mb-3">
              FYNE est un produit né du terrain, testé chez nous et validé par nos clients.
            </p>
            <p className="text-gray-200 font-semibold">
              C'est un concentré de notre expertise cyber et IA, de notre vision pédagogique, et de notre engagement en matière d'innovation utile et responsable.
            </p>
          </div>
        </motion.section>

        {/* CTA section */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre façon d'apprendre ?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Rejoignez FYNE dès aujourd'hui et découvrez comment notre plateforme peut vous aider à 
            atteindre vos objectifs professionnels plus efficacement.
          </p>
          <div className="flex justify-center">
            <Link href="/">
              <CyberButton 
                variant="primary" 
                className="px-8 py-5 text-lg"
              >
                Retour à l'accueil
              </CyberButton>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}