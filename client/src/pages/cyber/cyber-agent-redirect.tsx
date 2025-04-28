// Page de redirection du module CYBER AGENT
import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function CyberAgentRedirectPage() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  // Fonction pour rediriger
  const redirectToNewPage = useCallback(() => {
    setLocation('/cyber/cyber-agent-new');
  }, [setLocation]);
  
  // Effet pour le compte à rebours et la redirection automatique
  useEffect(() => {
    if (countdown <= 0) {
      redirectToNewPage();
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    // Nettoyage à la destruction du composant
    return () => clearTimeout(timer);
  }, [countdown, redirectToNewPage]);

  // Animation de transition
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div 
        className="max-w-md w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Redirection en cours...
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Le module CYBER AGENT a été mis à jour avec une nouvelle interface.
            Vous allez être redirigé automatiquement vers la nouvelle version.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-500/30">
            {countdown}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button
            onClick={() => setLocation('/cyber/cyber-agent-new')}
            className="w-full"
            size="lg"
          >
            Accéder immédiatement à la nouvelle version
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}