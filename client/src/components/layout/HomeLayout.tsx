import Header from "./Header";
import { motion } from "framer-motion";
import { 
  Github, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin,
  BrainCircuit, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ArrowRight,
  ChevronUp
} from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import mclogo from "@assets/mc2i.png";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Gérer l'affichage du bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Animation pour le footer
  const footerAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 overflow-auto">
      <Header isFeny={true} />

      <main className="flex-1 w-full pt-24">
        {children}
      </main>

      {/* Footer impressionnant */}
      <footer className="w-full bg-gradient-to-r from-gray-900 via-blue-950 to-indigo-950 text-white overflow-hidden relative">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 rounded-full bg-indigo-500/5 -bottom-32 -right-32"></div>
          <div className="absolute w-64 h-64 rounded-full bg-purple-500/5 bottom-20 left-1/4"></div>
          
          {/* Lignes de grille */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>
        
        {/* Wave divider au top du footer */}
        <div className="relative w-full h-16 bg-slate-50">
          <svg className="absolute -bottom-[1px] left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#172554" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Contenu du footer */}
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={footerAnimation}
          >
            {/* Logo et description de FYNE */}
            <motion.div variants={itemAnimation} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative overflow-hidden rounded-full">
                  <img src={mclogo} alt="mc2i Logo" className="h-10 w-auto" />
                </div>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
                  FYNE
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                La plateforme SaaS qui révolutionne l'apprentissage professionnel grâce à l'intelligence artificielle avancée et des simulations personnalisées.
              </p>
              
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github size={20} />
                </a>
              </div>
            </motion.div>
            
            {/* Navigation */}
            <motion.div variants={itemAnimation} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Plateforme</h3>
              <ul className="space-y-3">
                {['Modules', 'Fonctionnalités', 'Tarification', 'Entreprise', 'Partenaires'].map(item => (
                  <li key={item}>
                    <a href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 group">
                      <span className="w-0 h-0.5 bg-blue-400 group-hover:w-2 transition-all duration-300"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* Support */}
            <motion.div variants={itemAnimation} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Support</h3>
              <ul className="space-y-3">
                {['Centre d\'aide', 'Documentation', 'Communauté', 'API', 'Status'].map(item => (
                  <li key={item}>
                    <a href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 group">
                      <span className="w-0 h-0.5 bg-blue-400 group-hover:w-2 transition-all duration-300"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* Newsletter */}
            <motion.div variants={itemAnimation} className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Restez informé</h3>
              <p className="text-gray-300 text-sm">
                Abonnez-vous à notre newsletter pour recevoir nos dernières actualités et mises à jour.
              </p>
              
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="bg-white/10 text-white border border-gray-700 rounded-l-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-r-lg text-white"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
              
              <p className="text-gray-400 text-xs">
                En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Séparateur */}
          <div className="border-t border-gray-800 my-12 opacity-50"></div>
          
          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} FYNE. Tous droits réservés.
            </div>
            
            <div className="flex items-center gap-8">
              <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Mentions légales
              </a>
              <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Confidentialité
              </a>
              <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Bouton retour en haut */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-full shadow-lg z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          y: showScrollTop ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp size={24} />
      </motion.button>
    </div>
  );
}