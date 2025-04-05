import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Définition des types de jeux d'arcade
const ARCADE_GAMES = {
  'phishing-detective': {
    title: 'Detective de Phishing',
    description: "Apprenez à identifier les emails et messages frauduleux. L'IA génère des messages variés et vous devez repérer les indices suspects.",
    gradient: 'from-blue-700 to-blue-900',
    icon: <AlertTriangle className="w-6 h-6" />
  },
  'password-guardian': {
    title: 'Password Guardian',
    description: "Créez des mots de passe que l'IA tentera de déchiffrer. Apprenez les meilleures pratiques de sécurité des mots de passe.",
    gradient: 'from-green-700 to-green-900',
    icon: <Shield className="w-6 h-6" />
  },
  'firewall-defense': {
    title: 'Firewall Defense',
    description: "Un jeu de tower defense où vous protégez un réseau contre des vagues d'attaques cybernétiques.",
    gradient: 'from-amber-600 to-orange-700',
    icon: <Shield className="w-6 h-6" />
  },
  'codebreaker': {
    title: 'Code Breaker',
    description: "Déchiffrez des codes et apprenez les bases de la cryptographie de manière ludique avec des indices progressifs.",
    gradient: 'from-purple-700 to-purple-900',
    icon: <Info className="w-6 h-6" />
  }
};

export default function CyberArcadeGame() {
  const { gameId } = useParams();
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<any>(null);

  useEffect(() => {
    // Simuler le chargement du jeu
    const timer = setTimeout(() => {
      setLoading(false);
      
      if (gameId && gameId in ARCADE_GAMES) {
        setGameData(ARCADE_GAMES[gameId as keyof typeof ARCADE_GAMES]);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [gameId]);

  if (!gameId || !(gameId in ARCADE_GAMES)) {
    return (
      <HomeLayout>
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-gray-900 to-black p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Jeu non trouvé</AlertTitle>
            <AlertDescription>
              Le jeu que vous recherchez n'existe pas ou n'est pas encore disponible.
            </AlertDescription>
          </Alert>
          <Link href="/cyber/arcade">
            <Button className="mt-8 bg-purple-600 hover:bg-purple-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retourner à l'arcade
            </Button>
          </Link>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className={`min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b ${gameData?.gradient || 'from-purple-900 via-gray-900 to-black'}`}>
        {/* Arrière-plan avec animation */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/cyber/arcade" className="inline-flex items-center text-white hover:text-gray-200 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'arcade
          </Link>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-white">Chargement du jeu...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-800 flex items-center justify-center mr-4">
                  {gameData?.icon}
                </div>
                <h1 className="text-3xl font-bold text-white">{gameData?.title}</h1>
              </div>
              
              <p className="text-gray-300 mb-8">{gameData?.description}</p>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Instructions du jeu</h2>
                <p className="text-gray-300">
                  Ce jeu est en cours de développement complet. Une version de base est disponible, mais
                  toutes les fonctionnalités ne sont pas encore implémentées.
                </p>
              </div>
              
              <div className="bg-purple-900 bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-2xl font-bold text-white mb-4">Jeu en développement</h3>
                <p className="text-center text-gray-300 mb-6">
                  Nous travaillons activement sur ce jeu pour vous offrir une expérience d'apprentissage immersive.
                  Revenez bientôt pour découvrir la version complète !
                </p>
                <div className="animate-pulse">
                  <Info className="w-12 h-12 text-purple-300" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Link href="/cyber/arcade">
                  <Button className="bg-purple-700 hover:bg-purple-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retourner à l'arcade
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}