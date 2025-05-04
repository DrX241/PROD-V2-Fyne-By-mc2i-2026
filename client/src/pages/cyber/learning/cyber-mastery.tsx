import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ShieldCheck, LineChart, File, Settings, Award, Clock, Zap, Users, Target } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { useTheme } from '@/contexts/ThemeContext';

// Structure de données pour les thèmes de formation
interface LearningTheme {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  levels: number;
  skills: string[];
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  progress?: number;
  comingSoon?: boolean;
}

// Définition des parcours de formation
const learningThemes: LearningTheme[] = [
  {
    id: 'sensibilisation',
    title: 'Sensibilisation Cybersécurité',
    description: 'Apprenez les fondamentaux de la cybersécurité et les bonnes pratiques pour protéger votre organisation.',
    icon: <ShieldCheck className="h-8 w-8" />,
    color: 'bg-blue-600',
    levels: 5,
    skills: ['Identification des menaces', 'Phishing & Social Engineering', 'Sécurité des mots de passe', 'Protection des données', 'Réaction aux incidents'],
    difficulty: 'Débutant',
    progress: 0,
  },
  {
    id: 'rgpd',
    title: 'Cybersécurité et RGPD',
    description: 'Maîtrisez les exigences du RGPD et leur impact sur la cybersécurité de votre organisation.',
    icon: <File className="h-8 w-8" />,
    color: 'bg-purple-700',
    levels: 5,
    skills: ['Principes du RGPD', 'Traitement des données personnelles', 'Droits des personnes', 'Gestion des violations', 'Mesures techniques'],
    difficulty: 'Intermédiaire',
    progress: 0,
  },
  {
    id: 'analyse-risques',
    title: 'Analyse des Risques Cyber',
    description: 'Apprenez à identifier, évaluer et prioriser les risques de cybersécurité.',
    icon: <LineChart className="h-8 w-8" />,
    color: 'bg-amber-600',
    levels: 6,
    skills: ['Méthodes d\'analyse de risques', 'Cartographie des actifs', 'Évaluation des menaces', 'Gestion des vulnérabilités', 'Plans de traitement'],
    difficulty: 'Intermédiaire',
    progress: 0,
  },
  {
    id: 'audit-cyber',
    title: 'Audit Cybersécurité',
    description: 'Découvrez les méthodologies et outils pour réaliser des audits de sécurité efficaces.',
    icon: <Target className="h-8 w-8" />,
    color: 'bg-red-600',
    levels: 7,
    skills: ['Standards d\'audit (ISO27001, NIST)', 'Pentesting', 'Revue de code', 'Évaluation de l\'architecture', 'Rapports d\'audit'],
    difficulty: 'Avancé',
    progress: 0,
  },
  {
    id: 'gouvernance',
    title: 'Stratégie & Gouvernance Cyber',
    description: 'Développez une vision stratégique de la cybersécurité pour votre organisation.',
    icon: <Settings className="h-8 w-8" />,
    color: 'bg-emerald-700',
    levels: 5,
    skills: ['Cadres de gouvernance', 'Politiques de sécurité', 'Gestion des équipes cyber', 'Conformité réglementaire', 'KPI de sécurité'],
    difficulty: 'Avancé',
    progress: 0,
  },
];

/**
 * Carte de parcours d'apprentissage avec animations et informations détaillées
 */
const LearningThemeCard: React.FC<{ theme: LearningTheme, index: number }> = ({ theme, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();
  
  // Animation pour l'apparition des cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="col-span-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`h-full overflow-hidden relative transition-all duration-300 ${
        isDark 
          ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      } ${isHovered ? 'shadow-lg transform -translate-y-1' : 'shadow'}`}>
        {/* Bannière colorée en haut de la carte */}
        <div className={`h-2 w-full ${theme.color}`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${theme.color} text-white`}>
              {theme.icon}
            </div>
            <Badge variant={isDark ? "outline" : "secondary"} className="font-normal">
              {theme.difficulty}
            </Badge>
          </div>
          <CardTitle className="mt-2 text-xl text-blue-700">{theme.title}</CardTitle>
          <CardDescription className={`${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {theme.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Progression</span>
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{theme.progress || 0}%</span>
              </div>
              <Progress value={theme.progress || 0} className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-amber-500" />
                <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{theme.levels} niveaux</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{theme.skills.length} compétences</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-blue-800'}`}>Compétences clés :</span>
              <div className="flex flex-wrap gap-1">
                {theme.skills.slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="outline" className="font-normal text-xs text-blue-700 border-blue-300">
                    {skill}
                  </Badge>
                ))}
                {theme.skills.length > 3 && (
                  <Badge variant="outline" className="font-normal text-xs text-blue-700 border-blue-300">
                    +{theme.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Link href={`/cyber/learning/cyber-mastery/${theme.id}`} className="w-full">
            <Button 
              disabled={theme.comingSoon}
              variant={isDark ? "outline" : "default"} 
              className="w-full flex items-center justify-center gap-2"
            >
              {theme.comingSoon ? (
                <>
                  <span>Bientôt disponible</span>
                </>
              ) : (
                <>
                  <span>Commencer l'apprentissage</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

/**
 * Page principale de Cyber Mastery
 */
export default function CyberMasteryPage() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  
  return (
    <HomeLayout>
      <PageTitle title="Cyber Mastery" />
      
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Header avec navigation */}
        <header className={`py-6 ${isDark ? 'bg-slate-800/80' : 'bg-white'} shadow-sm backdrop-blur-sm sticky top-0 z-20`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Link href="/cyber">
                  <Button
                    variant="ghost"
                    className={`mb-2 sm:mb-0 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}`}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à I AM CYBER
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center">
                <BookOpen className={`h-5 w-5 mr-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Cyber Mastery
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isDark ? "outline" : "secondary"} className="font-normal">
                  <Zap className="h-3 w-3 mr-1" />
                  Nouveau
                </Badge>
                <Badge variant="outline" className={`font-normal ${isDark ? 'border-blue-500/50 text-blue-400' : 'border-blue-500 text-blue-600'}`}>
                  <Users className="h-3 w-3 mr-1" />
                  IA intégrée
                </Badge>
              </div>
            </div>
          </div>
        </header>
        
        {/* Introduction */}
        <section className={`py-12 ${isDark ? 'bg-gradient-to-b from-slate-800 to-slate-900' : 'bg-gradient-to-b from-blue-50 to-slate-50'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Maîtrisez la cybersécurité <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>en jouant</span>
              </motion.h2>
              
              <motion.p 
                className={`text-lg mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Explorez nos cinq parcours d'apprentissage interactifs pour développer vos compétences en cybersécurité. Chaque parcours combine théorie, simulations pratiques et évaluations adaptatives pour une expérience d'apprentissage optimale.
              </motion.p>
              
              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Badge className="py-1.5 px-3 text-sm bg-blue-500 text-white">Simulations interactives</Badge>
                <Badge className="py-1.5 px-3 text-sm bg-purple-500 text-white">Apprentissage par IA</Badge>
                <Badge className="py-1.5 px-3 text-sm bg-amber-500 text-white">Challenges pratiques</Badge>
                <Badge className="py-1.5 px-3 text-sm bg-emerald-500 text-white">Certification interne</Badge>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Grille des parcours */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h3 className={`text-2xl font-semibold mb-8 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Parcours d'apprentissage disponibles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningThemes.map((theme, index) => (
                <LearningThemeCard key={theme.id} theme={theme} index={index} />
              ))}
            </div>
          </div>
        </section>
        
        {/* Section Méthodologie */}
        <section className={`py-12 ${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h3 className={`text-2xl font-semibold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Notre approche pédagogique
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-white'} shadow`}>
                  <div className="text-amber-500 mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Apprentissage adaptatif</h4>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Notre IA analyse vos performances et adapte le contenu pour optimiser votre progression.
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-white'} shadow`}>
                  <div className="text-cyan-500 mb-4">
                    <Target className="h-8 w-8" />
                  </div>
                  <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Scénarios réalistes</h4>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Confrontez-vous à des situations inspirées de cas réels pour développer vos compétences pratiques.
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-white'} shadow`}>
                  <div className="text-purple-500 mb-4">
                    <Award className="h-8 w-8" />
                  </div>
                  <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Reconnaissance des compétences</h4>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Obtenez des badges et certifications internes validant vos nouvelles compétences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className={`py-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-inner`}>
          <div className="container mx-auto px-4 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Cyber Mastery © {new Date().getFullYear()} - Propulsé par GPT-4o
            </p>
          </div>
        </footer>
      </div>
    </HomeLayout>
  );
}