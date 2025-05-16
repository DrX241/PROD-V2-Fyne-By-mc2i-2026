import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronRight, ChevronLeft, Terminal, FileCode, Lightbulb, Award, Code, BookOpen, FileText, CheckCircle2, Coffee, Brain, BrainCircuit, Zap, ListChecks, FolderKanban, Microscope, Copy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PageTitle from '@/components/utils/PageTitle';

// Importation des modules
import Introduction from './modules/Introduction';
import Installation from './modules/Installation';
import BasesLangage from './modules/BasesLangage';
import StructuresDonnees from './modules/StructuresDonnees';
import StructuresControle from './modules/StructuresControle';
import Fonctions from './modules/Fonctions';
import Fichiers from './modules/Fichiers';
import ModulesDataScience from './modules/ModulesDataScience';
import BonnesPratiques from './modules/BonnesPratiques';
import ProjetFinal from './modules/ProjetFinal';

export default function PythonBasics() {
  const [activeSection, setActiveSection] = useState<string | null>('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const isSectionCompleted = (sectionId: string) => {
    return completedSections.includes(sectionId);
  };

  const totalSections = 10;
  const progressPercentage = (completedSections.length / totalSections) * 100;

  // Animations
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fonction pour passer à la section suivante
  const goToNextSection = (currentSection: string) => {
    markSectionComplete(currentSection);
    
    const sections = [
      'introduction', 
      'installation', 
      'bases', 
      'structures', 
      'controle', 
      'fonctions', 
      'fichiers', 
      'modules-data', 
      'bonnes-pratiques', 
      'projet-final'
    ];
    
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  // Fonction pour revenir à la section précédente
  const goToPrevSection = (currentSection: string) => {
    const sections = [
      'introduction', 
      'installation', 
      'bases', 
      'structures', 
      'controle', 
      'fonctions', 
      'fichiers', 
      'modules-data', 
      'bonnes-pratiques', 
      'projet-final'
    ];
    
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1]);
    }
  };

  // Rendu du contenu principal
  const renderContent = () => {
    switch(activeSection) {
      case 'introduction':
        return <Introduction goToNext={() => goToNextSection('introduction')} />;
      case 'installation':
        return <Installation goToNext={() => goToNextSection('installation')} goToPrev={() => goToPrevSection('installation')} />;
      case 'bases':
        return <BasesLangage goToNext={() => goToNextSection('bases')} goToPrev={() => goToPrevSection('bases')} />;
      case 'structures':
        return <StructuresDonnees goToNext={() => goToNextSection('structures')} goToPrev={() => goToPrevSection('structures')} />;
      case 'controle':
        return <StructuresControle goToNext={() => goToNextSection('controle')} goToPrev={() => goToPrevSection('controle')} />;
      case 'fonctions':
        return <Fonctions goToNext={() => goToNextSection('fonctions')} goToPrev={() => goToPrevSection('fonctions')} />;
      case 'fichiers':
        return <Fichiers goToNext={() => goToNextSection('fichiers')} goToPrev={() => goToPrevSection('fichiers')} />;
      case 'modules-data':
        return <ModulesDataScience goToNext={() => goToNextSection('modules-data')} goToPrev={() => goToPrevSection('modules-data')} />;
      case 'bonnes-pratiques':
        return <BonnesPratiques goToNext={() => goToNextSection('bonnes-pratiques')} goToPrev={() => goToPrevSection('bonnes-pratiques')} />;
      case 'projet-final':
        return <ProjetFinal goToPrev={() => goToPrevSection('projet-final')} />;
      default:
        return <Introduction goToNext={() => goToNextSection('introduction')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 to-slate-950 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="mb-6">
          <Link href="/data-ia/data-ia-academy">
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à Data & IA Academy
            </Button>
          </Link>
          <PageTitle
            title="Fondamentaux Python"
            subtitle="Les bases essentielles du langage de programmation Python pour la Data Science"
            icon={<Terminal className="h-8 w-8 text-blue-400" />}
          />
        </div>

        {/* Informations sur le cours */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-blue-900/20 backdrop-blur-sm border border-blue-800 rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Fondamentaux de Python pour la Data Science</h2>
              <p className="text-blue-200 mb-4 max-w-2xl">
                Ce cours vous guide à travers les concepts fondamentaux du langage Python et pose les bases essentielles pour votre parcours en science des données.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Débutant</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">4-6 heures</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Programmation</Badge>
                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">Data Science</Badge>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/50 border-4 border-blue-700">
                <div className="text-center">
                  <div className="text-xl font-bold">{progressPercentage.toFixed(0)}%</div>
                  <div className="text-xs text-blue-300">Complété</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Barre latérale */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className={`md:w-72 flex-shrink-0 bg-blue-900/20 border border-blue-800 rounded-xl p-4 ${sidebarOpen ? 'block' : 'hidden md:block'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Modules du cours</h3>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progression</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <nav className="space-y-1">
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'introduction' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('introduction')}
              >
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Introduction à Python</span>
                {isSectionCompleted('introduction') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'installation' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('installation')}
              >
                <Terminal className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Installation et configuration</span>
                {isSectionCompleted('installation') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'bases' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('bases')}
              >
                <FileCode className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Bases du langage</span>
                {isSectionCompleted('bases') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'structures' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('structures')}
              >
                <FolderKanban className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Structures de données</span>
                {isSectionCompleted('structures') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'controle' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('controle')}
              >
                <ListChecks className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Structures de contrôle</span>
                {isSectionCompleted('controle') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'fonctions' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('fonctions')}
              >
                <Code className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Fonctions et modules</span>
                {isSectionCompleted('fonctions') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'fichiers' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('fichiers')}
              >
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Manipulation de fichiers</span>
                {isSectionCompleted('fichiers') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'modules-data' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('modules-data')}
              >
                <BrainCircuit className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Modules pour Data Science</span>
                {isSectionCompleted('modules-data') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'bonnes-pratiques' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('bonnes-pratiques')}
              >
                <Lightbulb className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Bonnes pratiques</span>
                {isSectionCompleted('bonnes-pratiques') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              
              <div 
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-blue-800/50 ${activeSection === 'projet-final' ? 'bg-blue-800/50' : ''}`}
                onClick={() => setActiveSection('projet-final')}
              >
                <Award className="h-4 w-4 text-blue-400" />
                <span className="flex-grow">Projet final</span>
                {isSectionCompleted('projet-final') && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
            </nav>
          </motion.div>

          {/* Contenu du module */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex-grow bg-blue-900/20 border border-blue-800 rounded-xl p-6"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}