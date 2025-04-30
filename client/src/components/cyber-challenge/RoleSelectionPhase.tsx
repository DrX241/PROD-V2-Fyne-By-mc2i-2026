import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Database, Code, Briefcase, Server, Scale, DollarSign, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame, type GameRole } from '@/contexts/cyber-challenge/GameContext';

interface RoleSelectionPhaseProps {
  onComplete: () => void;
}

interface Role {
  id: GameRole;
  title: string;
  icon: React.ReactNode;
  description: string;
  level: string;
  responsibilities: string[];
}

export default function RoleSelectionPhase({ onComplete }: RoleSelectionPhaseProps) {
  const { selectRole } = useGame();
  const [selectedRoleId, setSelectedRoleId] = useState<GameRole | null>(null);
  const [isFlipped, setIsFlipped] = useState<Record<string, boolean>>({});

  // Définition des rôles disponibles
  const roles: Role[] = [
    {
      id: 'rssi',
      title: 'RSSI',
      icon: <Shield className="h-12 w-12 text-blue-400" />,
      description: 'Responsable Sécurité des Systèmes d\'Information - Le gardien de la stratégie de sécurité',
      level: 'Direction',
      responsibilities: [
        'Définir la stratégie de cybersécurité',
        'Gérer le budget sécurité',
        'Évaluer et atténuer les risques',
        'Coordonner la réponse aux incidents'
      ]
    },
    {
      id: 'ethical-hacker',
      title: 'Hacker Éthique',
      icon: <User className="h-12 w-12 text-red-400" />,
      description: 'Expert en tests d\'intrusion - Trouve les failles avant les malveillants',
      level: 'Expert technique',
      responsibilities: [
        'Effectuer des tests d\'intrusion',
        'Détecter les vulnérabilités',
        'Proposer des correctifs',
        'Réaliser des audits de sécurité'
      ]
    },
    {
      id: 'soc-analyst',
      title: 'Analyste SOC',
      icon: <Database className="h-12 w-12 text-yellow-400" />,
      description: 'Security Operations Center - La sentinelle qui surveille les menaces en temps réel',
      level: 'Opérationnel',
      responsibilities: [
        'Surveiller les alertes de sécurité',
        'Analyser les journaux d\'événements',
        'Détecter les comportements anormaux',
        'Répondre aux incidents de niveau 1'
      ]
    },
    {
      id: 'secure-developer',
      title: 'Développeur Sécurisé',
      icon: <Code className="h-12 w-12 text-green-400" />,
      description: 'Expert en développement sécurisé - Conçoit des applications résistantes aux attaques',
      level: 'Expert technique',
      responsibilities: [
        'Programmer de façon sécurisée',
        'Réaliser des tests de code',
        'Corriger les vulnérabilités',
        'Concevoir des architectures robustes'
      ]
    },
    {
      id: 'cybersecurity-consultant',
      title: 'Consultant Cybersécurité',
      icon: <Briefcase className="h-12 w-12 text-purple-400" />,
      description: 'Conseiller expert - Accompagne les organisations dans leur transformation sécurité',
      level: 'Expert & Stratégique',
      responsibilities: [
        'Auditer les infrastructures',
        'Conseiller sur les meilleures pratiques',
        'Accompagner la mise en conformité',
        'Former les équipes'
      ]
    },
    {
      id: 'system-administrator',
      title: 'Administrateur Système',
      icon: <Server className="h-12 w-12 text-cyan-400" />,
      description: 'Le gardien de l\'infrastructure - Assure la sécurité opérationnelle des systèmes',
      level: 'Opérationnel',
      responsibilities: [
        'Sécuriser les serveurs et réseaux',
        'Gérer les mises à jour de sécurité',
        'Configurer les pare-feu',
        'Gérer les droits d\'accès'
      ]
    },
    {
      id: 'cyber-legal',
      title: 'Juriste Cybersécurité',
      icon: <Scale className="h-12 w-12 text-orange-400" />,
      description: 'Expert juridique - Maîtrise le cadre légal de la sécurité numérique',
      level: 'Stratégique',
      responsibilities: [
        'Assurer la conformité réglementaire',
        'Gérer les notifications de violation',
        'Rédiger les politiques de sécurité',
        'Conseiller sur les aspects légaux des incidents'
      ]
    },
    {
      id: 'financial-director',
      title: 'Directeur Financier',
      icon: <DollarSign className="h-12 w-12 text-emerald-400" />,
      description: 'Responsable des risques cyber financiers - Évalue l\'impact économique des menaces',
      level: 'Direction',
      responsibilities: [
        'Évaluer le coût des risques cyber',
        'Gérer les assurances cyber',
        'Budgétiser les investissements sécurité',
        'Analyser le ROI des solutions'
      ]
    }
  ];

  // Basculer l'état de la carte (flip)
  const toggleCardFlip = (roleId: string) => {
    setIsFlipped(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  // Sélectionner un rôle
  const handleRoleSelection = (role: GameRole) => {
    setSelectedRoleId(role);
    selectRole(role);
  };

  // Confirmer la sélection et passer à l'étape suivante
  const confirmSelection = () => {
    if (selectedRoleId) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Choisissez votre rôle
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Votre expérience sera personnalisée en fonction du rôle professionnel que vous choisirez.
          Chaque rôle offre une perspective unique sur les enjeux de cybersécurité.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        {roles.map((role) => (
          <div
            key={role.id}
            className="relative perspective"
            onClick={() => toggleCardFlip(role.id)}
          >
            <motion.div
              className={`
                relative w-full h-64 transform-style-3d transition-transform duration-500
                ${isFlipped[role.id] ? 'rotate-y-180' : ''}
                ${selectedRoleId === role.id ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-blue-900' : ''}
              `}
            >
              {/* Face avant */}
              <div className={`absolute inset-0 backface-hidden ${isFlipped[role.id] ? 'hidden' : 'block'}`}>
                <Card className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-blue-900 border border-blue-500/30 hover:border-blue-400/60 cursor-pointer transition-all duration-300">
                  <div className="rounded-full bg-blue-900/50 p-4 mb-4">
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-sm text-blue-200 text-center">Cliquez pour plus d'informations</p>
                </Card>
              </div>
              
              {/* Face arrière */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped[role.id] ? 'block' : 'hidden'}`}>
                <Card className="h-full flex flex-col p-4 bg-gradient-to-br from-blue-900 to-indigo-900 border border-blue-500/30 cursor-pointer">
                  <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                  <p className="text-xs text-blue-200 mb-2">{role.description}</p>
                  <div className="mb-2">
                    <span className="text-xs font-semibold bg-blue-800 text-blue-100 rounded-full px-2 py-0.5">
                      Niveau: {role.level}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-cyan-300 mb-1">Responsabilités:</h4>
                    <ul className="text-xs text-blue-100">
                      {role.responsibilities.map((resp, index) => (
                        <li key={index} className="mb-1">• {resp}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection(role.id);
                    }}
                    className="mt-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="sm"
                  >
                    Choisir ce rôle
                  </Button>
                </Card>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {selectedRoleId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mx-auto bg-gradient-to-r from-blue-800/50 to-purple-900/50 rounded-lg p-6 border border-blue-500/30"
        >
          <div className="flex items-center mb-4">
            {roles.find(role => role.id === selectedRoleId)?.icon}
            <h3 className="text-xl font-bold ml-4 text-white">
              Vous avez choisi: {roles.find(role => role.id === selectedRoleId)?.title}
            </h3>
          </div>
          <p className="text-blue-100 mb-4">
            {roles.find(role => role.id === selectedRoleId)?.description}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={confirmSelection}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              Confirmer et continuer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}