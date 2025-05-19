import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Brain, Sparkles, BookOpen, Target, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

// Import image
import bgImage from '@assets/abstrait-avec-design-low-poly.jpg'; 

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

  // Features of FYNE
  const features = [
    {
      title: "Parcours adaptatifs",
      description: "Un apprentissage qui s'adapte automatiquement à votre rythme et votre niveau grâce à l'IA.",
      icon: <Target className="h-12 w-12 text-blue-400" />,
      color: "from-blue-900/40 to-blue-950/60 border-blue-700"
    },
    {
      title: "Coaching personnalisé",
      description: "Recevez des conseils et feedback pertinents sur vos compétences spécifiques.",
      icon: <Users className="h-12 w-12 text-indigo-400" />,
      color: "from-indigo-900/40 to-indigo-950/60 border-indigo-700"
    },
    {
      title: "Simulation de situations réelles",
      description: "Mettez en pratique vos connaissances dans des environnements simulés proches de la réalité.",
      icon: <Brain className="h-12 w-12 text-violet-400" />,
      color: "from-violet-900/40 to-violet-950/60 border-violet-700"
    },
    {
      title: "Modules interactifs",
      description: "Des exercices engageants qui rendent l'apprentissage plus efficace et mémorable.",
      icon: <BookOpen className="h-12 w-12 text-cyan-400" />,
      color: "from-cyan-900/40 to-cyan-950/60 border-cyan-700"
    },
    {
      title: "Analyse de performance",
      description: "Obtenez des insights détaillés sur vos progrès et domaines d'amélioration.",
      icon: <Sparkles className="h-12 w-12 text-emerald-400" />,
      color: "from-emerald-900/40 to-emerald-950/60 border-emerald-700"
    },
    {
      title: "Sécurité des données",
      description: "Vos informations et résultats sont protégés avec les plus hauts standards de confidentialité.",
      icon: <Shield className="h-12 w-12 text-amber-400" />,
      color: "from-amber-900/40 to-amber-950/60 border-amber-700"
    }
  ];

  // Benefits of using FYNE
  const benefits = [
    { text: "Amélioration continue des compétences", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> },
    { text: "Économie de temps grâce à un apprentissage efficace", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> },
    { text: "Adaptation aux besoins spécifiques de chaque utilisateur", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> },
    { text: "Feedback immédiat et constructif", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> },
    { text: "Motivation accrue par l'interaction", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> },
    { text: "Préparation optimale aux enjeux réels", icon: <CheckCircle className="h-5 w-5 text-emerald-400" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      {/* Hero section with background image */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black/40 z-10"></div>
        <img 
          src={bgImage} 
          alt="FYNE Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
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
              La plateforme d'apprentissage assistée par l'IA qui révolutionne votre développement professionnel
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        {/* What is FYNE section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Qu'est-ce que FYNE ?</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-300 mb-6">
              FYNE (For Your Next Experience) est une plateforme innovante qui combine la puissance de l'intelligence artificielle 
              avec des méthodes pédagogiques avancées pour offrir une expérience d'apprentissage personnalisée et immersive.
            </p>
            <p className="text-lg text-gray-300">
              Développée par mc2i, FYNE répond aux besoins de formation dans divers domaines professionnels, 
              de la gestion de projet à la cybersécurité, en passant par l'analyse de données et le développement de compétences interpersonnelles.
            </p>
          </div>
        </motion.section>

        {/* Features section */}
        <motion.section
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold mb-10 text-center">Fonctionnalités clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`bg-gradient-to-br ${feature.color} h-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits section */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-10 text-center">Avantages de FYNE</h2>
          <div className="max-w-3xl mx-auto bg-blue-900/20 border border-blue-700 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {benefit.icon}
                  <span className="text-gray-200">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA section */}
        <motion.section 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-6">Prêt à transformer votre façon d'apprendre ?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Rejoignez FYNE dès aujourd'hui et découvrez comment notre plateforme peut vous aider à 
            atteindre vos objectifs professionnels plus efficacement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cyber/roleplay">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Découvrir CYBER ACADEMY
              </Button>
            </Link>
            <Link href="/amoa/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg">
                Explorer AMOA ACADEMY
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}