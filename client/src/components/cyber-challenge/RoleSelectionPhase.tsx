import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, User, Code, Database, PieChart } from 'lucide-react';
import { useGameContext } from '@/contexts/cyber-challenge/GameContext';
import type { GameRole } from '@/contexts/cyber-challenge/GameContext';

interface RoleSelectionPhaseProps {
  onComplete: () => void;
}

const RoleSelectionPhase: React.FC<RoleSelectionPhaseProps> = ({ onComplete }) => {
  const { selectedRole, setSelectedRole } = useGameContext();
  const [showDetails, setShowDetails] = useState<GameRole | null>(null);

  const handleRoleSelect = (role: GameRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onComplete();
    }
  };

  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Détails des rôles disponibles
  const roles = [
    {
      id: 'rssi' as GameRole,
      title: 'RSSI',
      fullTitle: 'Responsable de la Sécurité des Systèmes d\'Information',
      icon: <Shield className="h-8 w-8" />,
      color: 'bg-red-500',
      description: 'Expert stratégique chargé de définir et mettre en œuvre la politique de cybersécurité de l\'organisation.',
      skills: ['Gestion des risques', 'Leadership', 'Prise de décision stratégique', 'Gestion de crise'],
      challenges: ['Prioriser les incidents', 'Coordonner les équipes', 'Communication avec la direction'],
    },
    {
      id: 'ethical-hacker' as GameRole,
      title: 'Hacker Éthique',
      fullTitle: 'Spécialiste en Tests d\'Intrusion',
      icon: <User className="h-8 w-8" />,
      color: 'bg-purple-500',
      description: 'Expert technique qui teste la sécurité des systèmes en simulant des attaques pour identifier les vulnérabilités.',
      skills: ['Analyse de vulnérabilités', 'Tests d\'intrusion', 'Social engineering', 'Reverse engineering'],
      challenges: ['Exploiter les failles de sécurité', 'Contourner les protections', 'Documenter les vulnérabilités'],
    },
    {
      id: 'developer' as GameRole,
      title: 'Développeur Sécurité',
      fullTitle: 'Développeur Spécialisé en Sécurité Applicative',
      icon: <Code className="h-8 w-8" />,
      color: 'bg-blue-500',
      description: 'Spécialiste qui intègre les bonnes pratiques de sécurité dès la conception des applications et corrige les vulnérabilités.',
      skills: ['Secure coding', 'Analyse de code', 'SAST/DAST', 'DevSecOps'],
      challenges: ['Identifier les vulnérabilités dans le code', 'Appliquer les correctifs', 'Intégrer la sécurité dans le SDLC'],
    },
    {
      id: 'sysadmin' as GameRole,
      title: 'Administrateur Système',
      fullTitle: 'Administrateur Système & Réseau',
      icon: <Database className="h-8 w-8" />,
      color: 'bg-green-500',
      description: 'Responsable de la maintenance et de la sécurisation de l\'infrastructure IT de l\'organisation.',
      skills: ['Gestion des accès', 'Hardening', 'Supervision', 'Gestion des patchs'],
      challenges: ['Maintenir la disponibilité', 'Déployer les correctifs de sécurité', 'Gérer les incidents au niveau infrastructure'],
    },
    {
      id: 'consultant' as GameRole,
      title: 'Consultant Cybersécurité',
      fullTitle: 'Consultant en Sécurité de l\'Information',
      icon: <PieChart className="h-8 w-8" />,
      color: 'bg-amber-500',
      description: 'Expert qui conseille les organisations sur leurs stratégies de sécurité et les aide à améliorer leur posture de sécurité.',
      skills: ['Analyse de risques', 'Conformité', 'Audit', 'Recommandations stratégiques'],
      challenges: ['Évaluer la maturité de sécurité', 'Proposer des améliorations', 'Accompagner la transformation'],
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Choisissez votre rôle</h2>
        <p className="text-blue-100">
          Chaque rôle offre une perspective unique sur les défis de cybersécurité.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {roles.map((role) => (
          <motion.div
            key={role.id}
            variants={cardVariants}
            className={`cursor-pointer rounded-lg p-4 ${selectedRole === role.id ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-cyan-400' : 'bg-gray-800 border border-gray-700 hover:border-gray-500'}`}
            onClick={() => handleRoleSelect(role.id)}
            onMouseEnter={() => setShowDetails(role.id)}
            onMouseLeave={() => setShowDetails(null)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${role.color} bg-opacity-20`}>
                {role.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{role.title}</h3>
                <p className="text-xs text-gray-400">{role.fullTitle}</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-2">
              {role.description}
            </p>
            
            {(showDetails === role.id || selectedRole === role.id) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-gray-700"
              >
                <h4 className="text-sm font-medium text-gray-200 mb-1">Compétences clés :</h4>
                <ul className="text-xs text-gray-400 list-disc list-inside mb-2">
                  {role.skills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
                
                <h4 className="text-sm font-medium text-gray-200 mb-1">Défis principaux :</h4>
                <ul className="text-xs text-gray-400 list-disc list-inside">
                  {role.challenges.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continuer
        </Button>
      </motion.div>
    </div>
  );
};

export default RoleSelectionPhase;