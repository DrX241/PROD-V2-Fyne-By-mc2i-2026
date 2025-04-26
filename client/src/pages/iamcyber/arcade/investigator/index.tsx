import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, FileText, Folder, File, Server, Mail, MessageSquare, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour les enquêtes
interface Evidence {
  id: string;
  title: string;
  type: 'email' | 'log' | 'file' | 'server' | 'chat';
  content: string;
  timestamp?: string;
  analyzed: boolean;
  tags: string[];
  metadata?: Record<string, string>;
}

interface Suspect {
  id: string;
  name: string;
  role: string;
  avatar: string;
  motif: string;
  suspicionLevel: number; // 0-100
  indicators: string[];
  evidenceLink: string[];
}

interface Investigation {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'expert';
  scenario: string;
  backgroundInfo: string;
  timeLimit: number; // en minutes
  evidences: Evidence[];
  suspects: Suspect[];
  solution: {
    culprit: string;
    explanation: string;
    timeline: string[];
    keyEvidence: string[];
  };
}

// Liste des enquêtes disponibles
const investigations = [
  {
    id: 'data-leak',
    title: 'FUITE DE DONNÉES CONFIDENTIELLES',
    description: 'Une société technologique a subi une fuite de données sensibles. Enquêtez pour déterminer qui en est responsable.',
    difficulty: 'débutant',
    gradient: 'from-blue-600 to-blue-900',
    icon: <File className="w-6 h-6" />
  },
  {
    id: 'ransomware-attack',
    title: 'ATTAQUE PAR RANSOMWARE',
    description: 'Une entreprise a été victime d\'une attaque par ransomware. Analysez l\'incident pour comprendre comment l\'attaque s\'est produite.',
    difficulty: 'intermédiaire',
    gradient: 'from-red-600 to-red-900',
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 'insider-threat',
    title: 'MENACE INTERNE',
    description: 'Des informations confidentielles ont été compromises. Identifiez la menace interne responsable de cette violation.',
    difficulty: 'expert',
    gradient: 'from-purple-600 to-purple-900',
    icon: <AlertCircle className="w-6 h-6" />
  }
];

export default function CyberInvestigator() {
  const [selectedInvestigation, setSelectedInvestigation] = useState<string | null>(null);
  const [hoveredCase, setHoveredCase] = useState<string | null>(null);

  return (
    <HomeLayout>
      <PageTitle title="Cyber Investigateur" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-indigo-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Cyber Arcade
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <Search className="mr-3 h-8 w-8" /> 
              Cyber Investigateur
            </h1>
          </div>
          
          <div className="max-w-3xl mb-12">
            <p className="text-lg text-indigo-100 mb-4">
              Plongez dans le rôle d'un cyber investigateur chargé de résoudre des incidents de sécurité complexes. 
              Analysez les preuves numériques, interrogez les suspects et reconstruisez la chronologie des événements pour identifier les coupables.
            </p>
            <p className="text-md text-indigo-200">
              Chaque enquête met en pratique vos compétences en cybersécurité : analyse forensique, traque des menaces, et résolution d'incidents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investigations.map((investigation) => (
              <motion.div
                key={investigation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden shadow-xl rounded-xl"
                onMouseEnter={() => setHoveredCase(investigation.id)}
                onMouseLeave={() => setHoveredCase(null)}
              >
                <Link href={`/cyber/arcade/cyber-investigator/${investigation.id}`}>
                  <div className={`bg-gradient-to-br ${investigation.gradient} p-6 h-full min-h-[220px] flex flex-col relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-2xl`}>
                    {/* Glow effect on hover */}
                    {hoveredCase === investigation.id && (
                      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    )}
                    
                    {/* Case file graphics */}
                    <div className="absolute top-3 right-3 opacity-20">
                      <FileText className="w-24 h-24" />
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="bg-white/10 p-2 rounded-lg mr-3">
                        {investigation.icon}
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {investigation.title}
                      </h2>
                    </div>
                    
                    <div className="mb-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        investigation.difficulty === 'débutant' ? 'bg-blue-900/60 text-blue-200' :
                        investigation.difficulty === 'intermédiaire' ? 'bg-yellow-900/60 text-yellow-200' :
                        'bg-red-900/60 text-red-200'
                      }`}>
                        {investigation.difficulty.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-indigo-100 text-sm mb-4 flex-grow">
                      {investigation.description}
                    </p>
                    
                    <div className="flex justify-end mt-2">
                      <div className="bg-white/10 hover:bg-white/20 py-1.5 px-4 rounded-lg text-white text-sm font-medium">
                        Ouvrir le dossier
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 px-6 py-4 bg-indigo-950/50 rounded-lg border border-indigo-500/30 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Folder className="mr-2 h-5 w-5 text-indigo-300" /> 
              Comment jouer
            </h2>
            <ul className="space-y-2 text-indigo-200">
              <li className="flex">
                <div className="text-indigo-400 mr-2">•</div>
                <span>Analysez toutes les preuves numériques disponibles</span>
              </li>
              <li className="flex">
                <div className="text-indigo-400 mr-2">•</div>
                <span>Établissez des liens entre les différents indices</span>
              </li>
              <li className="flex">
                <div className="text-indigo-400 mr-2">•</div>
                <span>Identifiez les suspects potentiels et leurs motivations</span>
              </li>
              <li className="flex">
                <div className="text-indigo-400 mr-2">•</div>
                <span>Reconstruisez la chronologie de l'incident</span>
              </li>
              <li className="flex">
                <div className="text-indigo-400 mr-2">•</div>
                <span>Présentez vos conclusions et identifiez le coupable</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}