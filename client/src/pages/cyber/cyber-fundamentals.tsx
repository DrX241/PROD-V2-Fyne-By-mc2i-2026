import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

// Icônes spécifiques pour chaque section
import { FaShieldAlt, FaClipboardCheck, FaSearch, FaBrain } from 'react-icons/fa';

const CyberFundamentals = () => {
  const [, setLocation] = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Définition des catégories
  const categories = [
    {
      id: 'protection',
      icon: <FaShieldAlt className="h-6 w-6 text-blue-400" />,
      emoji: '🛡️',
      title: 'Protection et Défense des Systèmes',
      description: "Empêcher, détecter, répondre aux attaques.",
      color: 'from-blue-600 to-blue-900',
      borderColor: 'border-blue-500/50',
      hoverColor: 'hover:bg-blue-800/20',
      topics: [
        'Pare-feu, antivirus, EDR',
        'Sécurité réseau (firewall, VPN, segmentation)',
        'Sécurité des endpoints et serveurs',
        'Chiffrement, authentification forte (MFA)'
      ]
    },
    {
      id: 'compliance',
      icon: <FaClipboardCheck className="h-6 w-6 text-green-400" />,
      emoji: '📋',
      title: 'Conformité, Gouvernance et Risques',
      description: "Respecter les règles, structurer la sécurité.",
      color: 'from-green-600 to-green-900',
      borderColor: 'border-green-500/50',
      hoverColor: 'hover:bg-green-800/20',
      topics: [
        'RGPD, ISO 27001, NIS2',
        'Politique de sécurité (PSSI)',
        'Gestion des risques (EBIOS, MEHARI)',
        'Audits, contrôle interne, conformité réglementaire'
      ]
    },
    {
      id: 'analysis',
      icon: <FaSearch className="h-6 w-6 text-amber-400" />,
      emoji: '🔍',
      title: 'Analyse et Réponse aux Incidents',
      description: "Savoir enquêter et agir en cas d'attaque.",
      color: 'from-amber-600 to-amber-900',
      borderColor: 'border-amber-500/50',
      hoverColor: 'hover:bg-amber-800/20',
      topics: [
        'SOC (Security Operations Center)',
        'SIEM, forensic, threat hunting',
        'Gestion de crise cyber',
        'Plan de reprise (PRA) / continuité (PCA)'
      ]
    },
    {
      id: 'culture',
      icon: <FaBrain className="h-6 w-6 text-purple-400" />,
      emoji: '🧠',
      title: 'Culture et Sensibilisation',
      description: "Faire de l'humain le premier rempart.",
      color: 'from-purple-600 to-purple-900',
      borderColor: 'border-purple-500/50',
      hoverColor: 'hover:bg-purple-800/20',
      topics: [
        'Formation & sensibilisation des utilisateurs',
        'Phishing, ingénierie sociale',
        'Bonnes pratiques (mots de passe, navigation)',
        "Simulation d'attaques (Red Team, campagnes internes)"
      ]
    }
  ];

  const toggleCategory = (id: string) => {
    if (expandedCategory === id) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(id);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen text-white">
      <Helmet>
        <title>Fondamentaux de la Cybersécurité | FYNE</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4 hover:bg-gray-800"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold font-data-title bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Fondamentaux de la Cybersécurité
          </h1>
        </div>
        
        <div className="mb-8 p-6 rounded-lg bg-black/50 border border-blue-900/50">
          <p className="text-lg text-gray-300">
            Explorez les piliers essentiels de la cybersécurité organisés en quatre domaines fondamentaux. Ces connaissances constitueront la base solide de votre expertise en sécurité numérique.
          </p>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className={`relative p-5 rounded-lg border-2 ${category.borderColor} bg-gradient-to-br ${category.color} overflow-hidden shadow-lg`}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div 
                className={`cursor-pointer ${expandedCategory === category.id ? 'mb-4' : ''}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 rounded-full bg-black/30 mr-3 flex-shrink-0">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <span className="mr-2">{category.emoji}</span> 
                      {category.title}
                    </h2>
                    <p className="text-sm text-gray-300">{category.description}</p>
                  </div>
                </div>
              </div>
              
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pl-14"
                >
                  <ul className="space-y-2 mb-4">
                    {category.topics.map((topic, index) => (
                      <li key={index} className={`p-2 rounded ${category.hoverColor} transition-colors duration-200`}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-white/70 rounded-full mr-3"></div>
                          <span>{topic}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pl-5">
                    <Button
                      className="bg-black/40 hover:bg-black/60 border border-white/20 text-white"
                      onClick={() => {
                        // Action future - pour l'instant, on reste sur cette page
                        alert("Fonctionnalité en développement");
                      }}
                    >
                      Explorer ce domaine
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Prêt à continuer votre parcours d'apprentissage ?
          </p>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5"
            onClick={() => setLocation('/cyber/learning-center')}
          >
            Accéder au centre d'apprentissage
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CyberFundamentals;