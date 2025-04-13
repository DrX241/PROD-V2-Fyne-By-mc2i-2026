import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Code, Layers, Cpu, Smartphone, RefreshCw, Zap, Users, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Image import
import mclogo from '@assets/mc2i.png';

export default function FyneInitialization() {
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Autoplay du slider avec possibilité de pause
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(prev => prev + 1);
        } else {
          // Attendre un peu plus longtemps sur la dernière slide avant de rediriger
          setTimeout(() => navigate('/home'), 1500);
        }
      }, 5000); // 5 secondes par slide
    }
    
    return () => clearTimeout(timer);
  }, [currentSlide, isAutoPlaying, navigate]);
  
  // Mise à jour de la barre de progression
  useEffect(() => {
    setProgress(((currentSlide + 1) / slides.length) * 100);
  }, [currentSlide]);
  
  // Passer à la slide suivante
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      navigate('/home');
    }
  };
  
  // Passer à la slide précédente
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };
  
  // Définition des slides
  const slides = [
    {
      title: "Bienvenue dans FYNE",
      subtitle: "La plateforme d'apprentissage immersive du futur",
      description: "FYNE est une solution innovante de formation développée entièrement sur mesure pour répondre aux besoins spécifiques des professionnels en cybersécurité, AMOA et Data & IA.",
      icon: <Layers className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Développé sur mesure", description: "Conçu spécifiquement pour répondre aux besoins de formation professionnelle" },
        { title: "Expérience immersive", description: "Plongez dans des scénarios réalistes qui simulent des situations professionnelles" },
        { title: "Intelligence artificielle avancée", description: "Propulsé par des modèles IA de pointe pour des interactions naturelles" }
      ]
    },
    {
      title: "Une architecture modulaire et évolutive",
      subtitle: "Construit from scratch pour une adaptabilité sans limite",
      description: "Grâce à son architecture entièrement personnalisée, FYNE peut être constamment enrichi avec de nouveaux modules, fonctionnalités et contenus pédagogiques.",
      icon: <Code className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Architecture ouverte", description: "Facilement extensible avec de nouveaux modules et fonctionnalités" },
        { title: "Intégration continue", description: "Mises à jour régulières basées sur les retours utilisateurs" },
        { title: "Personnalisation complète", description: "Adaptable à différents secteurs et besoins de formation" }
      ]
    },
    {
      title: "Un design responsive en développement",
      subtitle: "Accessible partout, à tout moment",
      description: "FYNE évolue vers une expérience totalement responsive, permettant aux apprenants d'accéder à leurs formations sur n'importe quel appareil, où qu'ils soient.",
      icon: <Smartphone className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Multi-plateforme", description: "Formation accessible sur desktop, tablette et mobile (en développement)" },
        { title: "Synchronisation cloud", description: "Progression sauvegardée et accessible depuis n'importe quel appareil" },
        { title: "Interface adaptative", description: "Expérience utilisateur optimisée pour chaque format d'écran" }
      ]
    },
    {
      title: "La puissance de l'IA au service de la formation",
      subtitle: "Des interactions humainement authentiques",
      description: "FYNE exploite l'intelligence artificielle la plus avancée pour offrir des interactions naturelles et personnalisées, adaptées au niveau et aux besoins de chaque apprenant.",
      icon: <Cpu className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Personnalisation dynamique", description: "Contenus et défis adaptés au niveau de compétence de chaque utilisateur" },
        { title: "Feedback instantané", description: "Analyse en temps réel des réponses et apprentissage continu" },
        { title: "Simulation de situations complexes", description: "Génération de scénarios variés et réalistes à l'infini" }
      ]
    },
    {
      title: "Une solution économique et écologique",
      subtitle: "Formation sans limite à coût maîtrisé",
      description: "FYNE permet de multiplier les mises en situation et les heures de formation sans augmenter les coûts, tout en réduisant l'empreinte environnementale des déplacements.",
      icon: <RefreshCw className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Coût par formation optimisé", description: "Nombre illimité de sessions pour un coût fixe" },
        { title: "Réduction des déplacements", description: "Formation à distance réduisant l'empreinte carbone" },
        { title: "Contenu toujours à jour", description: "Mises à jour automatiques sans coûts supplémentaires" }
      ]
    },
    {
      title: "Une infinité de scénarios de formation",
      subtitle: "Apprentissage contextuel et pratique",
      description: "Avec FYNE, chaque session est unique. Les formateurs peuvent générer une infinité de scénarios adaptés aux besoins spécifiques de chaque groupe ou individu.",
      icon: <Zap className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Génération dynamique", description: "Nouveaux scénarios créés à la demande pour des formations toujours renouvelées" },
        { title: "Apprentissage personnalisé", description: "Adaptation aux objectifs pédagogiques spécifiques" },
        { title: "Mise en situation réaliste", description: "Situations inspirées de cas réels du monde professionnel" }
      ]
    },
    {
      title: "Un écosystème complet de formations",
      subtitle: "I AM CYBER, I AM AMOA, I AM DATA & IA",
      description: "FYNE intègre des parcours spécialisés pour les différents métiers et compétences essentiels aux organisations modernes.",
      icon: <Globe className="w-16 h-16 text-blue-600" />,
      features: [
        { title: "Expertise cybersécurité", description: "Formation aux meilleures pratiques et réponses aux incidents" },
        { title: "Compétences AMOA", description: "Développement des capacités d'analyse et de gestion de projet" },
        { title: "Maîtrise data et IA", description: "Compréhension et utilisation des technologies d'intelligence artificielle" }
      ]
    },
    {
      title: "Entrez dans l'ère de la formation immersive",
      subtitle: "Commencez votre expérience FYNE dès maintenant",
      description: "Découvrez une nouvelle façon d'apprendre, plus interactive, plus engageante et plus efficace. FYNE transforme la formation professionnelle en une expérience captivante.",
      icon: <Users className="w-16 h-16 text-blue-600" />,
      features: []
    }
  ];
  
  const currentSlideData = slides[currentSlide];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Barre supérieure avec logo, progression et boutons */}
      <div className="w-full px-5 py-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={mclogo} alt="mc2i Logo" className="h-8" />
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span>|</span>
            <span className="font-bold text-blue-600">FYNE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 w-32 sm:w-64">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm text-gray-500 font-medium">{currentSlide + 1}/{slides.length}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/home')}
            className="ml-2"
          >
            Passer
          </Button>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Section de gauche avec illustration/icône */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 flex flex-col justify-center items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-6 p-6 bg-white/10 rounded-full"
                  >
                    {currentSlideData.icon}
                  </motion.div>
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-center"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{currentSlideData.subtitle}</h2>
                    <p className="text-white/80">Découvrez le futur de la formation professionnelle</p>
                  </motion.div>
                </div>
                
                {/* Section de droite avec contenu */}
                <div className="lg:col-span-3 p-6 sm:p-8 md:p-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{currentSlideData.title}</h1>
                    <p className="text-lg text-gray-600 mb-8">{currentSlideData.description}</p>
                    
                    {currentSlideData.features.length > 0 && (
                      <div className="space-y-6">
                        {currentSlideData.features.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                            className="flex items-start gap-4"
                          >
                            <div className="mt-1 bg-blue-100 p-2 rounded-full">
                              <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                              <p className="text-gray-600">{feature.description}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {currentSlide === slides.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-8"
                      >
                        <Button 
                          size="lg" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigate('/home')}
                        >
                          Démarrer l'expérience FYNE <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Contrôles de navigation */}
      <div className="bg-white border-t p-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="text-gray-700"
        >
          Précédent
        </Button>
        
        <Button
          variant={isAutoPlaying ? "outline" : "default"}
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={isAutoPlaying ? "text-gray-700" : "bg-blue-600 text-white"}
        >
          {isAutoPlaying ? "Pause" : "Lecture auto"}
        </Button>
        
        <Button
          onClick={nextSlide}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {currentSlide < slides.length - 1 ? "Suivant" : "Commencer"}
        </Button>
      </div>
    </div>
  );
}