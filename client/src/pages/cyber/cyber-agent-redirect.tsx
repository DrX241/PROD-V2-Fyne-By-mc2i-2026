// Redirection vers la nouvelle page Cyber Agent
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import PageTitle from '@/components/utils/PageTitle';

export default function CyberAgentRedirectPage() {
  // Navigation
  const [, setLocation] = useLocation();
  
  // Redirection automatique vers la nouvelle version
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      setLocation('/cyber/cyber-agent-new');
    }, 5000); // Redirection après 5 secondes
    
    return () => clearTimeout(redirectTimer);
  }, [setLocation]);

  // Redirection manuelle
  const handleRedirect = () => {
    setLocation('/cyber/cyber-agent-new');
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <PageTitle title="Redirection Cyber Agent" />
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Redirection vers la nouvelle version</h2>
          
          <p className="text-gray-800 dark:text-gray-200 mb-6 font-medium">
            La page que vous essayez d'atteindre a été mise à jour. 
            Vous allez être automatiquement redirigé vers la nouvelle version du module Cyber Agent dans 5 secondes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRedirect}
              className="sm:flex-1 sm:max-w-xs mx-auto"
              size="lg"
            >
              Accéder maintenant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}