import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, BarChart2, FileText, RefreshCw, Download, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useGame } from '@/contexts/cyber-challenge/GameContext';

interface ResultsPhaseProps {
  onRestart: () => void;
}

interface PerformanceData {
  category: string;
  score: number;
  maxScore: number;
  color: string;
}

export default function ResultsPhase({ onRestart }: ResultsPhaseProps) {
  const { 
    selectedRole, 
    selectedMode, 
    score, 
    timeElapsed, 
    logs,
    maxStages,
    resetGame
  } = useGame();
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [feedback, setFeedback] = useState('');
  const [performanceLevel, setPerformanceLevel] = useState<'expert' | 'avancé' | 'intermédiaire' | 'débutant'>('intermédiaire');
  
  useEffect(() => {
    // Générer des données de performance simulées
    // Dans un vrai produit, ces données viendraient du backend
    
    const data: PerformanceData[] = [
      {
        category: 'Analyse technique',
        score: Math.floor(Math.random() * 30) + 60, // Score entre 60 et 90
        maxScore: 100,
        color: 'blue'
      },
      {
        category: 'Prise de décision',
        score: Math.floor(Math.random() * 30) + 60,
        maxScore: 100,
        color: 'purple'
      },
      {
        category: 'Gestion des risques',
        score: Math.floor(Math.random() * 30) + 60,
        maxScore: 100,
        color: 'green'
      },
      {
        category: 'Communication',
        score: Math.floor(Math.random() * 30) + 60,
        maxScore: 100,
        color: 'orange'
      }
    ];
    
    setPerformanceData(data);
    
    // Déterminer le niveau de performance
    const normalizedScore = score / (maxStages * 10); // Score max possible: 10 points par étape
    if (normalizedScore >= 0.8) {
      setPerformanceLevel('expert');
    } else if (normalizedScore >= 0.6) {
      setPerformanceLevel('avancé');
    } else if (normalizedScore >= 0.4) {
      setPerformanceLevel('intermédiaire');
    } else {
      setPerformanceLevel('débutant');
    }
    
    // Générer un feedback simulé
    // Dans un vrai produit, ce feedback viendrait de l'API GPT-4o
    generateFeedback();
  }, [score, maxStages]);
  
  // Générer un feedback personnalisé
  const generateFeedback = () => {
    // Simuler un feedback personnalisé basé sur le score et le rôle
    const feedbacks = [
      `Vos compétences en tant que ${getRoleName()} montrent une maîtrise avancée des principes de cybersécurité. Vous avez particulièrement excellé dans l'analyse technique et la prise de décision rapide. Pour progresser davantage, concentrez-vous sur l'amélioration de vos compétences en communication et en gestion d'équipe lors des crises.`,
      
      `Votre approche de la cybersécurité est méthodique et efficace. En tant que ${getRoleName()}, vous avez démontré une bonne compréhension des enjeux techniques et organisationnels. Pour atteindre le niveau expert, approfondissez vos connaissances en veille sur les menaces et en analyse forensique.`,
      
      `Vous avez fait preuve d'un bon jugement dans plusieurs scénarios complexes. Votre point fort est la gestion des risques, mais vous pourriez améliorer votre rapidité d'action dans les situations d'urgence. Continuez à développer vos compétences en analyse technique pour renforcer votre profil de ${getRoleName()}.`
    ];
    
    setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);
  };
  
  // Obtenir le nom du rôle sélectionné
  const getRoleName = () => {
    switch (selectedRole) {
      case 'rssi': return 'RSSI';
      case 'ethical-hacker': return 'Hacker Éthique';
      case 'soc-analyst': return 'Analyste SOC';
      case 'secure-developer': return 'Développeur Sécurisé';
      case 'cybersecurity-consultant': return 'Consultant Cybersécurité';
      case 'system-administrator': return 'Administrateur Système';
      case 'cyber-legal': return 'Juriste Cybersécurité';
      case 'financial-director': return 'Directeur Financier';
      default: return 'professionnel de cybersécurité';
    }
  };
  
  // Obtenir le nom du mode sélectionné
  const getModeName = () => {
    switch (selectedMode) {
      case 'classic-challenge': return 'Défi Classique';
      case 'tunnel-effect': return 'Effet Tunnel';
      case 'pca-scenario': return 'Scénario PCA';
      case 'hackathon': return 'Hackathon Cyber';
      default: return 'inconnu';
    }
  };
  
  // Formater le temps (secondes → MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Redémarrer le jeu
  const handleRestart = () => {
    resetGame();
    onRestart();
  };
  
  // Simuler le téléchargement d'un rapport PDF
  const handleDownloadReport = () => {
    alert("Fonctionnalité de téléchargement du rapport PDF à implémenter dans la version finale.");
  };
  
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Résultats de votre simulation
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Vous avez terminé le mode {getModeName()} en tant que {getRoleName()}.
          Voici l'analyse de votre performance.
        </p>
      </motion.div>

      {/* Carte de score principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl mb-8"
      >
        <Card className="bg-gradient-to-br from-blue-900/80 to-indigo-900/80 border border-blue-500/30 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center">
              <div className="mb-2 text-blue-300 text-sm font-medium">Score total</div>
              <div className="text-5xl font-bold text-white">{score}</div>
              <div className="mt-2">
                <Badge 
                  className={`
                    ${performanceLevel === 'expert' ? 'bg-green-600' : ''}
                    ${performanceLevel === 'avancé' ? 'bg-blue-600' : ''}
                    ${performanceLevel === 'intermédiaire' ? 'bg-orange-600' : ''}
                    ${performanceLevel === 'débutant' ? 'bg-red-600' : ''}
                  `}
                >
                  Niveau {performanceLevel}
                </Badge>
              </div>
            </div>
            
            <div className="h-16 w-0.5 bg-blue-700/50 hidden md:block"></div>
            
            <div className="flex flex-col items-center">
              <div className="mb-2 text-blue-300 text-sm font-medium">Temps total</div>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-400" />
                <span className="text-3xl font-bold text-white">{formatTime(timeElapsed)}</span>
              </div>
            </div>
            
            <div className="h-16 w-0.5 bg-blue-700/50 hidden md:block"></div>
            
            <div className="flex flex-col items-center">
              <div className="mb-2 text-blue-300 text-sm font-medium">Défis complétés</div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                <span className="text-3xl font-bold text-white">{maxStages}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Graphiques de performance */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-4xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {performanceData.map((data, index) => (
          <Card 
            key={data.category} 
            className="bg-gradient-to-br from-gray-900/80 to-blue-900/60 border border-blue-500/30 p-4"
          >
            <h3 className="text-lg font-semibold text-blue-300 mb-3">{data.category}</h3>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-200">
                    {data.score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-300">
                    {data.maxScore}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                  className={`
                    shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center 
                    ${data.color === 'blue' ? 'bg-blue-500' : ''}
                    ${data.color === 'purple' ? 'bg-purple-500' : ''}
                    ${data.color === 'green' ? 'bg-green-500' : ''}
                    ${data.color === 'orange' ? 'bg-orange-500' : ''}
                  `}
                ></motion.div>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>
      
      {/* Feedback et analyse */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="w-full max-w-4xl mb-8"
      >
        <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-blue-500/30 p-6">
          <div className="flex items-center mb-4">
            <Award className="h-6 w-6 text-yellow-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Analyse de votre performance</h3>
          </div>
          <p className="text-blue-100 mb-6">
            {feedback}
          </p>
          
          <Accordion type="single" collapsible className="border-t border-blue-800/50 pt-4">
            <AccordionItem value="log" className="border-b-blue-800/50">
              <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Journal d'activité
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-blue-200">
                <div className="max-h-60 overflow-y-auto bg-blue-950/50 p-3 rounded text-sm font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="tips" className="border-b-blue-800/50">
              <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Conseils d'amélioration
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-blue-200">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Améliorez votre temps de réaction en pratiquant régulièrement des simulations de crise.</li>
                  <li>Approfondissez vos connaissances techniques sur les vulnérabilités actuelles.</li>
                  <li>Développez votre capacité à communiquer efficacement avec différentes parties prenantes.</li>
                  <li>Adoptez une approche proactive plutôt que réactive face aux menaces.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </motion.div>
      
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
      >
        <Button 
          onClick={handleRestart}
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
          size="lg"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Recommencer
        </Button>
        
        <Button 
          onClick={handleDownloadReport}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Télécharger le rapport PDF
        </Button>
      </motion.div>
    </div>
  );
}

// Composant Badge pour afficher des étiquettes colorées
function Badge({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}