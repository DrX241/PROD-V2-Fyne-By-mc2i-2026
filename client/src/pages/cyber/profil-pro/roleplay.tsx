import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronLeft, 
  Shield, 
  Database, 
  Code, 
  Network, 
  Lock, 
  Users, 
  ArrowRight,
  Laptop,
  FileText,
  Briefcase,
  BookOpen
} from 'lucide-react';
import PageTitle from '@/components/utils/PageTitle';

// Variantes pour les animations
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -5, boxShadow: '0 10px 30px rgba(0, 0, 50, 0.2)' }
};

// Animation du code en arrière-plan
const codeLines = [
  "class CyberSecurityProfessional {",
  "  constructor() {",
  "    this.skills = [];",
  "    this.experience = 0;",
  "    this.certifications = [];",
  "  }",
  "",
  "  addSkill(skill) {",
  "    this.skills.push(skill);",
  "    console.log(`New skill acquired: ${skill}`);",
  "    return this;",
  "  }",
  "",
  "  gainExperience(years) {",
  "    this.experience += years;",
  "    console.log(`Experience level: ${this.experience} years`);",
  "    return this;",
  "  }",
  "}"
];

const ProfilProRoleplay = () => {
  const [setLocation] = useLocation();
  
  // Définition des profils professionnels
  const profiles = [
    {
      id: 'debutant',
      title: 'Je suis débutant en cybersécurité',
      description: 'Découverte des fondamentaux et premiers pas',
      color: 'green',
      border: 'border-green-500',
      gradient: 'from-green-800 to-green-900',
      buttonGradient: 'from-green-600 to-green-800',
      buttonHover: 'hover:from-green-700 hover:to-green-900',
      textColor: 'text-green-200',
      icon: <BookOpen className="h-10 w-10 text-green-300" />,
      link: '/cyber/learning-center/modules/cyber-pour-debutants',
      skills: [
        'Comprendre les risques du monde numérique',
        'Acquérir les bases de la cybersécurité',
        'Développer les bons réflexes de protection'
      ]
    },
    {
      id: 'rssi',
      title: 'Je suis RSSI',
      description: 'Responsable Sécurité des Systèmes d\'Information',
      color: 'blue',
      border: 'border-blue-500',
      gradient: 'from-blue-800 to-blue-900',
      buttonGradient: 'from-blue-600 to-blue-800',
      buttonHover: 'hover:from-blue-700 hover:to-blue-900',
      textColor: 'text-blue-200',
      icon: <Shield className="h-10 w-10 text-blue-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Définir la politique de sécurité globale',
        'Gérer les risques et les incidents',
        'Piloter les audits et la conformité'
      ]
    },
    {
      id: 'soc-analyst',
      title: 'Je suis Analyste SOC',
      description: 'Security Operations Center Analyst',
      color: 'emerald',
      border: 'border-emerald-500',
      gradient: 'from-emerald-800 to-emerald-900',
      buttonGradient: 'from-emerald-600 to-emerald-800',
      buttonHover: 'hover:from-emerald-700 hover:to-emerald-900',
      textColor: 'text-emerald-200',
      icon: <Database className="h-10 w-10 text-emerald-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Surveiller en temps réel les alertes de sécurité',
        'Analyser et qualifier les incidents',
        'Coordonner la réponse aux menaces détectées'
      ]
    },
    {
      id: 'pentester',
      title: 'Je suis Pentester',
      description: 'Ethical Hacker / Testeur d\'intrusion',
      color: 'red',
      border: 'border-red-500',
      gradient: 'from-red-800 to-red-900',
      buttonGradient: 'from-red-600 to-red-800',
      buttonHover: 'hover:from-red-700 hover:to-red-900',
      textColor: 'text-red-200',
      icon: <Code className="h-10 w-10 text-red-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Identifier les vulnérabilités des systèmes',
        'Exploiter éthiquement les failles de sécurité',
        'Proposer des recommandations précises'
      ]
    },
    {
      id: 'consultant',
      title: 'Je suis Consultant Cyber',
      description: 'Expert-conseil en cybersécurité',
      color: 'purple',
      border: 'border-purple-500',
      gradient: 'from-purple-800 to-purple-900',
      buttonGradient: 'from-purple-600 to-purple-800',
      buttonHover: 'hover:from-purple-700 hover:to-purple-900',
      textColor: 'text-purple-200',
      icon: <Briefcase className="h-10 w-10 text-purple-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Analyser les besoins de sécurité des clients',
        'Élaborer des stratégies de protection adaptées',
        'Accompagner la transformation sécuritaire'
      ]
    },
    {
      id: 'security-engineer',
      title: 'Je suis Ingénieur Sécurité',
      description: 'Concepteur de solutions de sécurité',
      color: 'amber',
      border: 'border-amber-500',
      gradient: 'from-amber-800 to-amber-900',
      buttonGradient: 'from-amber-600 to-amber-800',
      buttonHover: 'hover:from-amber-700 hover:to-amber-900',
      textColor: 'text-amber-200',
      icon: <Lock className="h-10 w-10 text-amber-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Concevoir des architectures sécurisées',
        'Implémenter des solutions de protection',
        'Automatiser la détection et la réponse'
      ]
    },
    {
      id: 'security-awareness',
      title: 'Je suis Formateur Cyber',
      description: 'Spécialiste sensibilisation et formation',
      color: 'cyan',
      border: 'border-cyan-500',
      gradient: 'from-cyan-800 to-cyan-900',
      buttonGradient: 'from-cyan-600 to-cyan-800',
      buttonHover: 'hover:from-cyan-700 hover:to-cyan-900',
      textColor: 'text-cyan-200',
      icon: <Users className="h-10 w-10 text-cyan-300" />,
      link: '/cyber/profil-pro',
      skills: [
        'Créer des programmes de sensibilisation engageants',
        'Former tous types de collaborateurs',
        'Évaluer l\'efficacité des actions de formation'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900 text-white p-6">
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-cyan-800 text-cyan-400 hover:bg-black/70 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
          onClick={() => setLocation("/cyber/learning-center")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      <PageTitle title="Profils Professionnels en Cybersécurité | FYNE" />

      {/* En-tête */}
      <div className="mb-12 text-center mt-10 relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 cyber-glitch-text mb-4">
          CYBER PROFILS
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Explorez les différents métiers de la cybersécurité en vous mettant dans la peau 
          des professionnels pour découvrir leurs missions et compétences.
        </p>
      </div>

      {/* Animation de code en arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <pre className="text-cyan-400 text-xl font-mono font-bold animate-scrolling-code relative z-5">
          {Array(30).fill(codeLines).flat().join('\n')}
        </pre>
      </div>

      {/* Grid des profils professionnels */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            transition={{ duration: 0.3 }}
            className="flex"
          >
            <Card className={`w-full bg-gray-900/70 backdrop-blur-sm border-2 ${profile.border} shadow-lg`}>
              <CardHeader className={`pb-4 bg-gradient-to-br ${profile.gradient} rounded-t-lg`}>
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-black/30 backdrop-blur-sm`}>
                    {profile.icon}
                  </div>
                </div>
                <CardTitle className={`text-2xl text-center ${profile.textColor}`}>
                  {profile.title}
                </CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  {profile.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  {profile.skills.map((skill, index) => (
                    <li key={index} className="flex items-start">
                      <div className="p-1 rounded-full bg-gray-800 mr-2 mt-0.5">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <span className={profile.textColor}>{skill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {profile.id === 'debutant' ? (
                  <Button 
                    className={`w-full py-6 bg-gradient-to-r ${profile.buttonGradient} ${profile.buttonHover} text-white group`}
                    onClick={() => setLocation(profile.link)}
                  >
                    <span>Accéder au module</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <Button 
                    className={`w-full py-6 bg-gradient-to-r ${profile.buttonGradient} ${profile.buttonHover} text-white group`}
                    disabled
                  >
                    <span>Bientôt disponible</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Note en bas de page */}
      <div className="text-center text-gray-500 mt-12 text-sm">
        <p>Les simulations de profils professionnels seront disponibles prochainement.</p>
      </div>
    </div>
  );
};

export default ProfilProRoleplay;