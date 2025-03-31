import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Database, ListChecks, Plus, ArrowRight, 
  BarChart4, Users, Award, Zap, BrainCircuit, Bot, 
  Sparkles, Star, BookOpen, Brain, Rocket, Target, TrendingUp,
  CircleUserRound, Cpu, AreaChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeLayout from "@/components/layout/HomeLayout";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import mcLogoPath from "@assets/mc2i.png";

// Animation de machine learning
const AIAnimation = () => {
  const [dots, setDots] = useState<Array<{x: number, y: number, opacity: number, size: number}>>([]);
  
  useEffect(() => {
    const generateRandomDots = () => {
      const newDots = [];
      for (let i = 0; i < 50; i++) {
        newDots.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          opacity: 0.2 + Math.random() * 0.8,
          size: 1 + Math.random() * 4
        });
      }
      return newDots;
    };
    
    setDots(generateRandomDots());
    
    const interval = setInterval(() => {
      setDots(dots => dots.map(dot => ({
        ...dot,
        x: (dot.x + 0.1) % 100,
        y: (dot.y + Math.sin(dot.x / 10) * 0.2) % 100,
        opacity: 0.2 + Math.random() * 0.8
      })));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-900/30 rounded-3xl overflow-hidden">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: dot.opacity,
              boxShadow: `0 0 ${dot.size * 2}px ${dot.size}px rgba(59, 130, 246, ${dot.opacity})`
            }}
          />
        ))}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <div className="absolute inset-0 rounded-full border-4 border-blue-300/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BrainCircuit className="w-12 h-12 md:w-16 md:h-16 text-blue-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ModulesPage() {
  const [location, setLocation] = useLocation();
  const [isHovering, setIsHovering] = useState("");

  const modules = [
    {
      id: "cyber",
      title: "I AM CYBER",
      description: "Développez vos compétences en cybersécurité à travers des scénarios interactifs et immersifs guidés par l'IA.",
      icon: <ShieldCheck className="w-12 h-12 text-white" />,
      iconBg: "bg-blue-600",
      color: "border-blue-200 hover:shadow-xl hover:scale-105 hover:border-blue-300",
      link: "/cyber",
      bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      id: "data-ia",
      title: "I AM DATA & IA",
      description: "Maîtrisez les concepts de data science et d'intelligence artificielle grâce à des cas pratiques et des simulations avancées.",
      icon: <Database className="w-12 h-12 text-white" />,
      iconBg: "bg-purple-600",
      color: "border-purple-200 hover:shadow-xl hover:scale-105 hover:border-purple-300",
      link: "/data-ia",
      bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      id: "amoa",
      title: "I AM AMOA",
      description: "Perfectionnez vos compétences en assistance à maîtrise d'ouvrage et gestion de projet avec des mentors virtuels experts.",
      icon: <ListChecks className="w-12 h-12 text-white" />,
      iconBg: "bg-emerald-600",
      color: "border-emerald-200 hover:shadow-xl hover:scale-105 hover:border-emerald-300",
      link: "/amoa",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100"
    },
    {
      id: "custom",
      title: "Soyez qui vous voulez",
      description: "Créez votre propre parcours d'apprentissage personnalisé adapté à vos besoins spécifiques avec notre technologie IA générative.",
      icon: <Plus className="w-12 h-12 text-white" />,
      iconBg: "bg-rose-600",
      color: "border-rose-200 hover:shadow-xl hover:scale-105 hover:border-rose-300",
      link: "/custom",
      bgGradient: "bg-gradient-to-br from-rose-50 to-rose-100"
    }
  ];

  const features = [
    {
      icon: <Bot className="h-10 w-10 text-blue-600" />,
      title: "Assistants IA personnalisés",
      description: "Des mentors virtuels qui s'adaptent à votre style d'apprentissage et vous guident de manière personnalisée"
    },
    {
      icon: <Brain className="h-10 w-10 text-blue-600" />,
      title: "Apprentissage adaptatif",
      description: "Algorithmes d'IA qui analysent votre progression et ajustent le contenu pour maximiser votre développement"
    },
    {
      icon: <Sparkles className="h-10 w-10 text-blue-600" />,
      title: "Scénarios immersifs",
      description: "Simulations de situations réelles générant une expérience d'apprentissage engageante et mémorable"
    },
    {
      icon: <BookOpen className="h-10 w-10 text-blue-600" />,
      title: "Contenu dynamique",
      description: "Ressources qui évoluent grâce à l'IA pour rester à jour avec les dernières avancées dans chaque domaine"
    }
  ];

  const stats = [
    { value: "95%", label: "Taux de satisfaction", icon: <Star className="h-8 w-8 text-amber-500" /> },
    { value: "78%", label: "Amélioration des compétences", icon: <TrendingUp className="h-8 w-8 text-emerald-500" /> },
    { value: "4.8/5", label: "Note moyenne", icon: <Target className="h-8 w-8 text-rose-500" /> },
    { value: "97%", label: "Application pratique", icon: <Rocket className="h-8 w-8 text-indigo-500" /> }
  ];

  const testimonials = [
    {
      content: "La plateforme FYNE a révolutionné notre approche de formation en cybersécurité. Les PNJ IA offrent une expérience d'apprentissage vraiment interactive et réaliste.",
      author: "Sophia Martin",
      role: "RSSI, Groupe Bancaire International",
      avatar: <CircleUserRound className="h-12 w-12 text-gray-400" />
    },
    {
      content: "Le module DATA & IA a permis à mes équipes de monter rapidement en compétences sur des sujets complexes. L'approche par simulation est extrêmement efficace.",
      author: "Thomas Dubois",
      role: "Directeur Data Science, Entreprise CAC 40",
      avatar: <CircleUserRound className="h-12 w-12 text-gray-400" />
    }
  ];

  const handleModuleClick = (link: string) => {
    setLocation(link);
  };

  // Tech icons animés
  const techIcons = [
    <Cpu key="cpu" className="h-10 w-10 text-blue-500/70" />,
    <Bot key="bot" className="h-10 w-10 text-indigo-500/70" />,
    <Brain key="brain" className="h-10 w-10 text-purple-500/70" />,
    <Database key="database" className="h-10 w-10 text-emerald-500/70" />,
    <AreaChart key="chart" className="h-10 w-10 text-rose-500/70" />
  ];

  return (
    <HomeLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-500 rounded-full p-1.5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-blue-300 font-medium">Propulsé par l'intelligence artificielle</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Transformez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">potentiel</span> avec FYNE
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-xl">
                Explorez une nouvelle dimension d'apprentissage interactif grâce à nos modules d'intelligence artificielle avancés qui s'adaptent à votre progression.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg border-0"
                  onClick={() => handleModuleClick('/cyber')}
                >
                  Explorer les modules
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8"
                >
                  Découvrir FYNE
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-blue-200">Utilisé par :</span>
                <img src={mcLogoPath} alt="mc2i" className="h-8" />
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium border-2 border-indigo-900">
                      {i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-medium border-2 border-indigo-900">
                    +50
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 h-[400px] md:h-[500px] relative">
              <AIAnimation />
              
              {/* Floating tech icons */}
              <div className="absolute inset-0">
                {techIcons.map((icon, index) => (
                  <div 
                    key={index}
                    className="absolute animate-float"
                    style={{
                      left: `${10 + (index * 20)}%`,
                      top: `${20 + (index * 10)}%`,
                      animationDelay: `${index * 0.5}s`,
                      animationDuration: `${5 + index}s`
                    }}
                  >
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 shadow-lg">
                      {icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/5 to-transparent h-32"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
              >
                <div className="mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section with Animated Border */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Une expérience d'apprentissage <span className="text-blue-600">révolutionnaire</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Notre technologie d'IA générative crée un environnement d'apprentissage personnalisé et hautement interactif
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-6 group-hover:bg-blue-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ce que nos utilisateurs disent</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez comment FYNE transforme l'apprentissage professionnel
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="inline-block h-5 w-5 text-amber-400 mr-1" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  {testimonial.avatar}
                  <div className="ml-4">
                    <h4 className="text-gray-900 font-semibold">{testimonial.author}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules Section avec effet de survol amélioré */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Modules de formation <span className="text-blue-600">nouvelle génération</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Explorez nos modules spécialisés conçus pour vous propulser vers l'excellence professionnelle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {modules.map((module) => (
              <div 
                key={module.id}
                onMouseEnter={() => setIsHovering(module.id)}
                onMouseLeave={() => setIsHovering("")}
                className={cn(
                  `p-8 rounded-3xl transition-all duration-500 ${module.color} h-full flex flex-col`,
                  module.bgGradient,
                  isHovering === module.id ? "shadow-2xl scale-105" : "shadow-md"
                )}
                onClick={() => handleModuleClick(module.link)}
              >
                <div className={`${module.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform transition-transform duration-500 ${isHovering === module.id ? "rotate-3 scale-110" : ""}`}>
                  {module.icon}
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">{module.title}</h2>
                <p className="text-gray-700 mb-6 flex-grow">{module.description}</p>
                <Button 
                  className={cn(
                    "w-fit mt-auto group transition-all duration-300",
                    isHovering === module.id 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModuleClick(module.link);
                  }}
                >
                  Découvrir
                  <ArrowRight className={cn(
                    "ml-2 h-4 w-4 transition-transform duration-300",
                    isHovering === module.id ? "translate-x-1" : "group-hover:translate-x-1"
                  )} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à transformer votre apprentissage ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Rejoignez notre communauté d'apprenants et accédez à des contenus interactifs propulsés par l'IA
          </p>
          <Button 
            size="lg"
            onClick={() => handleModuleClick('/cyber')} 
            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg shadow-xl"
          >
            Commencer l'aventure
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Footer Amélioré */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4">Modules</h3>
              <ul className="space-y-2">
                <li><a href="/cyber" className="text-gray-400 hover:text-white transition-colors">I AM CYBER</a></li>
                <li><a href="/data-ia" className="text-gray-400 hover:text-white transition-colors">I AM DATA & IA</a></li>
                <li><a href="/amoa" className="text-gray-400 hover:text-white transition-colors">I AM AMOA</a></li>
                <li><a href="/custom" className="text-gray-400 hover:text-white transition-colors">Parcours personnalisé</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partenaires</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Statut système</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">RGPD</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accessibilité</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-2xl font-bold mr-2 text-blue-400">FYNE</div>
              <span className="text-gray-500">|</span>
              <img src={mcLogoPath} alt="mc2i" className="h-6 ml-2" />
            </div>
            <p className="text-gray-500">
              © 2025 mc2i. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Les animations sont définies dans index.css */}
    </HomeLayout>
  );
}