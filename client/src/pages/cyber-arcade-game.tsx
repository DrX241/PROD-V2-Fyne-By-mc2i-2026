import React, { useEffect, useState } from 'react';
import { Link, useParams, Route } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Shield, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FirewallDefensePage from './games/FirewallDefensePage';

// Définition des types de jeux d'arcade
const ARCADE_GAMES = {
  'cyber-detective': {
    title: 'Cyber Detective',
    description: "Enquêtez sur une intrusion informatique en explorant des scènes interactives. Collectez des indices et résolvez des énigmes de cybersécurité.",
    gradient: 'from-emerald-700 to-emerald-900',
    icon: <Search className="w-6 h-6" />,
    details: {
      objectif: "Enquêter sur une violation de données en identifiant les indices, comprendre la méthode d'attaque et résoudre les énigmes de sécurité.",
      fonctionnement: [
        "Exploration d'environnements interactifs en mode point & click",
        "Collecte d'indices et d'artefacts numériques liés à une cyberattaque",
        "Interaction avec divers éléments du décor et objets pour révéler des informations",
        "Résolution d'énigmes basées sur des concepts réels de cybersécurité"
      ],
      competences: ["Analyse forensique de base", "Pensée critique", "Résolution de problèmes", "Connaissances en sécurité informatique"],
      niveaux: ["Débutant: Scène simple avec indices évidents", "Intermédiaire: Environnement plus complexe nécessitant une analyse approfondie", "Expert: Investigation complète d'un incident de cybersécurité avancé"]
    }
  },
  'phishing-detective': {
    title: 'Detective de Phishing',
    description: "Apprenez à identifier les emails et messages frauduleux. L'IA génère des messages variés et vous devez repérer les indices suspects.",
    gradient: 'from-blue-700 to-blue-900',
    icon: <AlertTriangle className="w-6 h-6" />,
    details: {
      objectif: "Détecter les tentatives de phishing et protéger les données sensibles de l'entreprise.",
      fonctionnement: [
        "Analyse d'emails et messages suspects générés par l'IA",
        "Identification des indicateurs de phishing (fautes d'orthographe, domaines suspects, demandes urgentes)",
        "Évaluation des liens et pièces jointes potentiellement dangereux",
        "Classification des messages selon leur niveau de risque"
      ],
      competences: ["Attention aux détails", "Analyse critique", "Reconnaissance des modèles de fraude"],
      niveaux: ["Débutant: Emails simples avec indices évidents", "Intermédiaire: Messages plus sophistiqués", "Expert: Attaques de spear phishing ciblées"]
    }
  },
  'password-guardian': {
    title: 'Password Guardian',
    description: "Créez des mots de passe que l'IA tentera de déchiffrer. Apprenez les meilleures pratiques de sécurité des mots de passe.",
    gradient: 'from-[#006a9e] to-[#004e78]',
    icon: <Shield className="w-6 h-6" />,
    details: {
      objectif: "Comprendre les principes de création de mots de passe sécurisés et les méthodes utilisées pour les pirater.",
      fonctionnement: [
        "Création de mots de passe selon différentes contraintes",
        "Simulation d'attaques par force brute et par dictionnaire",
        "Visualisation en temps réel de la force du mot de passe",
        "Apprentissage des techniques d'authentification multi-facteurs"
      ],
      competences: ["Gestion sécurisée des accès", "Compréhension des algorithmes de hachage", "Évaluation des risques"],
      niveaux: ["Débutant: Principes de base des mots de passe forts", "Intermédiaire: Gestionnaires de mots de passe", "Expert: Défense contre les attaques avancées"]
    }
  },
  'firewall-defense': {
    title: 'Firewall Defense',
    description: "Un jeu de tower defense où vous protégez un réseau contre des vagues d'attaques cybernétiques.",
    gradient: 'from-amber-600 to-orange-700',
    icon: <Shield className="w-6 h-6" />,
    details: {
      objectif: "Protéger une infrastructure réseau contre différents types d'attaques en déployant des solutions de sécurité adaptées.",
      fonctionnement: [
        "Positionnement stratégique des pare-feu et autres mécanismes de défense",
        "Gestion des ressources limitées (budget, bande passante)",
        "Réaction à différentes vagues d'attaques (DDoS, injection SQL, etc.)",
        "Adaptation en temps réel aux évolutions des menaces"
      ],
      competences: ["Architecture réseau", "Priorisation des menaces", "Stratégie de défense en profondeur"],
      niveaux: ["Débutant: Réseau simple avec attaques basiques", "Intermédiaire: Topologie plus complexe et attaques mixtes", "Expert: Scénarios de menaces persistantes avancées (APT)"]
    }
  },
  'codebreaker': {
    title: 'Code Breaker',
    description: "Déchiffrez des codes et apprenez les bases de la cryptographie de manière ludique avec des indices progressifs.",
    gradient: 'from-purple-700 to-purple-900',
    icon: <Info className="w-6 h-6" />,
    details: {
      objectif: "Comprendre les principes fondamentaux de la cryptographie et développer des compétences en résolution de problèmes cryptographiques.",
      fonctionnement: [
        "Déchiffrement de messages encodés avec différentes méthodes (César, Vigenère, etc.)",
        "Résolution d'énigmes basées sur des concepts cryptographiques",
        "Utilisation d'indices et d'outils d'analyse de fréquence",
        "Progression à travers des niveaux de difficulté croissante"
      ],
      competences: ["Pensée analytique", "Compréhension des algorithmes de chiffrement", "Résolution méthodique de problèmes"],
      niveaux: ["Débutant: Chiffrements simples par substitution", "Intermédiaire: Chiffrements polyalphabétiques", "Expert: Cryptographie moderne et challenges avancés"]
    }
  },
  'pca-crisis-mode': {
    title: 'PCA Crisis Mode',
    description: "Simulation d'un plan de continuité d'activité face à un incident majeur. Coordonnez votre réponse avec différentes parties prenantes dans un environnement de crise.",
    gradient: 'from-red-700 to-red-900',
    icon: <AlertTriangle className="w-6 h-6" />,
    details: {
      objectif: "S'entraîner à prendre des décisions stratégiques lors d'une crise cybernétique majeure en tenant compte de multiples facteurs (techniques, légaux, financiers, réputationnels).",
      fonctionnement: [
        "Scénario immersif de rançongiciel ou d'attaque interne",
        "Interaction avec différents interlocuteurs (DG, RSSI, Communication, Juridique) joués par l'IA",
        "Prise de décisions critiques (restaurer les systèmes, payer la rançon, avertir les parties prenantes)",
        "Gestion des conséquences de chaque décision sur le budget, la réputation et les relations clients"
      ],
      competences: ["Gestion de crise", "Communication sous pression", "Prise de décision stratégique", "Analyse d'impact business"],
      niveaux: ["Débutant: Incident à impact limité", "Intermédiaire: Crise affectant des systèmes critiques", "Expert: Attaque complexe avec tensions internes et externes maximales"]
    }
  },
  'osint-investigator': {
    title: 'OSINT Investigator',
    description: "Menez l'enquête en utilisant uniquement des sources d'information ouvertes. Découvrez comment les attaquants peuvent exploiter les informations publiques.",
    gradient: 'from-blue-600 to-indigo-800',
    icon: <Search className="w-6 h-6" />,
    details: {
      objectif: "Apprendre à recueillir et analyser des informations provenant de sources ouvertes pour mener une investigation de cybersécurité.",
      fonctionnement: [
        "Recherche d'informations via différents moteurs et outils spécialisés",
        "Analyse de profils sur les réseaux sociaux et bases de données publiques",
        "Collecte et organisation d'indices pour résoudre une enquête",
        "Évaluation critique de la pertinence et de la fiabilité des informations trouvées"
      ],
      competences: ["Techniques de recherche avancée", "Analyse de réseaux sociaux", "Vérification de données", "Collecte éthique d'informations"],
      niveaux: ["Débutant: Recherches simples et cas d'investigation basiques", "Intermédiaire: Analyses plus poussées avec recoupements", "Expert: Enquêtes complexes nécessitant l'utilisation de techniques OSINT avancées"]
    }
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
          <div className="flex gap-4 mt-8">
            <Link href="/cyber/arcade">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retourner à l'arcade
              </Button>
            </Link>
            <Link href="/cyber">
              <Button variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-900/20">
                <Shield className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </Link>
          </div>
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
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/cyber/arcade" className="inline-flex items-center text-white hover:text-gray-200 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'arcade
            </Link>
            <Link href="/cyber" className="inline-flex items-center text-purple-300 hover:text-white transition-colors">
              <Shield className="mr-2 h-4 w-4" />
              Retour à I AM CYBER
            </Link>
          </div>
          
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
              
              {gameData?.details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Objectif</h2>
                    <p className="text-gray-300">
                      {gameData.details.objectif}
                    </p>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Compétences développées</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {gameData.details.competences.map((competence: string, index: number) => (
                        <li key={index}>{competence}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {gameData?.details && (
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Fonctionnement du jeu</h2>
                  <div className="space-y-4">
                    <ol className="list-decimal list-inside text-gray-300 space-y-2">
                      {gameData.details.fonctionnement.map((etape: string, index: number) => (
                        <li key={index} className="pl-2">{etape}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              
              {gameData?.details && (
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Niveaux de difficulté</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {gameData.details.niveaux.map((niveau: string, index: number) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border ${
                          index === 0 ? 'border-[#006a9e] bg-[#006a9e]/20' : 
                          index === 1 ? 'border-yellow-500 bg-yellow-900/20' : 
                          'border-red-500 bg-red-900/20'
                        }`}
                      >
                        <p className="text-gray-200 text-sm">{niveau}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
{gameId === 'cyber-detective' ? (
                <div className="bg-emerald-900 bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Cyber Detective</h3>
                  <p className="text-center text-gray-300 mb-6">
                    Enquêtez sur une violation de données en explorant des environnements interactifs. 
                    Collectez des indices, analysez des artefacts numériques et résolvez les énigmes de sécurité.
                  </p>
                  <Link href="/cyber/arcade/cyber-detective/game">
                    <Button 
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg shadow-lg"
                    >
                      Lancer l'enquête
                    </Button>
                  </Link>
                </div>
              ) : gameId === 'osint-investigator' ? (
                <div className="bg-indigo-900 bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center">
                  <h3 className="text-2xl font-bold text-white mb-4">OSINT Investigator</h3>
                  <p className="text-center text-gray-300 mb-6">
                    Menez l'enquête en utilisant uniquement des sources d'information ouvertes.
                    Découvrez comment collecter et analyser des informations pour résoudre une affaire.
                  </p>
                  <Link href="/cyber/arcade/osint-investigator">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg"
                    >
                      Lancer l'investigation
                    </Button>
                  </Link>
                </div>
              ) : gameId === 'firewall-defense' ? (
                <div className="bg-amber-900 bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Firewall Defense</h3>
                  <p className="text-center text-gray-300 mb-6">
                    Protégez votre réseau contre des vagues d'attaques avec ce jeu de tower defense. 
                    Placez stratégiquement vos défenses pour contrer les différentes menaces.
                  </p>
                  <Link href="/games/firewall-defense">
                    <Button 
                      size="lg"
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg shadow-lg"
                    >
                      Lancer le jeu
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-purple-900 bg-opacity-50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <h3 className="text-2xl font-bold text-white mb-4">Jeu en développement</h3>
                  <p className="text-center text-gray-300 mb-6">
                    Nous travaillons activement sur ce jeu pour vous offrir une expérience d'apprentissage immersive.
                    Revenez bientôt pour découvrir la version complète !
                  </p>
                  <div className="animate-pulse">
                    <Info className="w-12 h-12 text-purple-300" />
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/cyber/arcade">
                  <Button className="bg-purple-700 hover:bg-purple-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retourner à l'arcade
                  </Button>
                </Link>
                <Link href="/cyber">
                  <Button variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-900/20">
                    <Shield className="mr-2 h-4 w-4" />
                    Retour à I AM CYBER
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