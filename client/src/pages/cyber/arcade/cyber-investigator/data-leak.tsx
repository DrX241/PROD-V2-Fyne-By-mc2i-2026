import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, File, Mail, Shield, 
  Server, AlertCircle, FileText, Folders, 
  User, Users, CheckCircle, XCircle, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import DebriefingComponent from '@/components/cyber/DebriefingComponent';
import ContextualDocumentation from '@/components/cyber/ContextualDocumentation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Types
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
  motif: string;
  notes: string;
  suspicionLevel: number; // 0-100
  indicators: string[];
  evidenceLink: string[];
}

// Investigation State
const INITIAL_TIME = 45 * 60; // 45 minutes in seconds

// Liste des preuves disponibles
const evidenceData: Evidence[] = [
  {
    id: 'email-ceo',
    title: 'Email du PDG',
    type: 'email',
    content: `De: alexander.dorman@techinnovate.fr
À: tous@techinnovate.fr
Objet: URGENT - Violation de données potentielle

Chers employés,

Nous avons eu confirmation d'une possible violation de données sensibles concernant notre nouveau projet Quantum. Des informations confidentielles semblent avoir été divulguées à notre concurrent principal.

J'ai demandé à notre équipe de sécurité informatique de mener une enquête approfondie. Merci de coopérer pleinement si vous êtes contactés pour fournir des informations.

Cette fuite pourrait avoir des conséquences graves pour l'avenir de notre entreprise.

Alexander Dorman
PDG, TechInnovate`,
    timestamp: '2025-04-20 09:15:32',
    analyzed: false,
    tags: ['urgent', 'violation', 'projet-quantum']
  },
  {
    id: 'server-logs',
    title: 'Journaux de serveur',
    type: 'log',
    content: `
2025-04-19 23:45:12 [INFO] Session login: sophie.mercier@techinnovate.fr (192.168.1.45)
2025-04-19 23:47:33 [INFO] Access granted: Project Quantum repository (user: sophie.mercier)
2025-04-19 23:48:05 [INFO] File download: quantum_specs_v3.2.pdf (user: sophie.mercier)
2025-04-19 23:51:27 [INFO] File download: quantum_pricing_confidential.xlsx (user: sophie.mercier)
2025-04-19 23:53:10 [INFO] User accessed: Client database (user: sophie.mercier)
2025-04-19 23:59:45 [INFO] Session logout: sophie.mercier@techinnovate.fr

2025-04-20 02:12:55 [INFO] External access attempt (IP: 78.45.112.93) - BLOCKED
2025-04-20 02:13:12 [INFO] External access attempt (IP: 78.45.112.93) - BLOCKED
2025-04-20 02:14:02 [INFO] External access attempt (IP: 78.45.112.93) - BLOCKED

2025-04-20 07:30:22 [INFO] Session login: marc.dubois@techinnovate.fr (192.168.1.23)
2025-04-20 07:34:11 [ALERT] Unusual file access pattern detected (user: marc.dubois)
2025-04-20 07:35:44 [INFO] Access granted: Employee records (user: marc.dubois)
2025-04-20 07:36:12 [INFO] Access granted: Payroll system (user: marc.dubois)
2025-04-20 07:39:55 [INFO] Multiple file downloads initiated (user: marc.dubois)
2025-04-20 07:42:30 [INFO] Session logout: marc.dubois@techinnovate.fr
`,
    timestamp: '2025-04-20 08:00:00',
    analyzed: false,
    tags: ['serveur', 'logs', 'accès-fichiers']
  },
  {
    id: 'email-suspicious',
    title: 'Email suspect',
    type: 'email',
    content: `De: julie.leroy@techinnovate.fr
À: thomas.bernard@techinnovate.fr
Objet: Re: Dîner ce soir ?

Thomas,

Je ne peux pas ce soir, je dois terminer un dossier urgent. 

Au fait, as-tu eu des nouvelles concernant les bonus de fin d'année ? J'ai entendu que certains dans l'équipe de marketing ont reçu des offres intéressantes de la part de NexGen Systems. Je commence à me demander si nous sommes vraiment appréciés ici.

Parlons-en demain au déjeuner.

Julie`,
    timestamp: '2025-04-19 17:22:05',
    analyzed: false,
    tags: ['personnel', 'mécontentement']
  },
  {
    id: 'access-card-logs',
    title: "Registre des badges d'accès",
    type: 'log',
    content: `REGISTRE DES ACCÈS - BÂTIMENT PRINCIPAL (19-20 AVRIL 2025)

19/04/2025 17:05 - ENTRÉE - Julie Leroy - Développeur Senior - Niveau 2
19/04/2025 17:32 - SORTIE - Julie Leroy - Développeur Senior - Niveau 2
19/04/2025 18:15 - ENTRÉE - Marc Dubois - Responsable RH - Niveau 3
19/04/2025 19:42 - SORTIE - Marc Dubois - Responsable RH - Niveau 3
19/04/2025 21:37 - ENTRÉE - Sophie Mercier - Ingénieur Projet - Niveau 2
19/04/2025 23:42 - ENTRÉE - Sophie Mercier - Salle des serveurs - Niveau 4 (ACCÈS EXCEPTIONNEL)
20/04/2025 00:17 - SORTIE - Sophie Mercier - Niveau principal
20/04/2025 07:15 - ENTRÉE - Marc Dubois - Responsable RH - Niveau 3
20/04/2025 07:30 - ENTRÉE - Marc Dubois - Archives - Niveau 1
20/04/2025 07:58 - SORTIE - Marc Dubois - Niveau principal

NOTE: Accès à la salle des serveurs par Sophie Mercier autorisé exceptionnellement par Paul Martin (DSI) - Motif: "Mise à jour urgente des serveurs de développement"`,
    timestamp: '2025-04-20 08:30:15',
    analyzed: false,
    tags: ['badge', 'accès-physique', 'salle-serveurs']
  },
  {
    id: 'email-it-manager',
    title: 'Email du DSI',
    type: 'email',
    content: `De: paul.martin@techinnovate.fr
À: alexander.dorman@techinnovate.fr
Objet: Re: URGENT - Violation de données potentielle

Alexander,

J'ai lancé une analyse préliminaire. Nous avons identifié plusieurs activités suspectes:

1. Accès tardif aux serveurs contenant les données du projet Quantum
2. Téléchargements de fichiers confidentiels en dehors des heures de bureau
3. Tentatives d'accès externe au réseau après minuit

Je n'ai pas autorisé d'accès exceptionnel à la salle des serveurs récemment. Nous devrions vérifier qui a utilisé son badge d'accès la nuit dernière.

Je consulte également les journaux de transfert de données pour identifier d'éventuelles communications externes non autorisées.

Paul Martin
Directeur des Systèmes d'Information`,
    timestamp: '2025-04-20 09:45:22',
    analyzed: false,
    tags: ['urgent', 'investigation', 'autorisation']
  },
  {
    id: 'financial-records',
    title: 'Relevés bancaires',
    type: 'file',
    content: `TRANSACTIONS BANCAIRES RÉCENTES - EMPLOYÉS SOUS SURVEILLANCE

SOPHIE MERCIER
10/04/2025 - Dépôt - 3,500€ - Salaire mensuel
15/04/2025 - Retrait - 1,200€ - --
18/04/2025 - Dépôt - 15,000€ - Virement externe (Crédit Industriel)

MARC DUBOIS
05/04/2025 - Dépôt - 4,200€ - Salaire mensuel
12/04/2025 - Retrait - 850€ - --
14/04/2025 - Retrait - 1,000€ - --
16/04/2025 - Dépôt - 2,000€ - Remboursement prêt personnel

JULIE LEROY
08/04/2025 - Dépôt - 3,800€ - Salaire mensuel
13/04/2025 - Retrait - 2,200€ - --
17/04/2025 - Dépôt - 1,500€ - Virement (source: Thomas Bernard)`,
    timestamp: '2025-04-20 10:15:00',
    analyzed: false,
    tags: ['financier', 'transactions', 'dépôts-suspects']
  },
];

// Liste des suspects
const suspectData: Suspect[] = [
  {
    id: 'sophie-mercier',
    name: 'Sophie Mercier',
    role: 'Ingénieur Projet',
    motif: 'A récemment été écartée d\'une promotion importante au profit d\'un collègue moins expérimenté.',
    notes: 'Travaille tard fréquemment. A accédé au système à des heures inhabituelles.',
    suspicionLevel: 0,
    indicators: [
      'Accès tardif aux fichiers du projet',
      'Dépôt bancaire suspect de 15 000€',
      'Accès inhabituel à la salle des serveurs'
    ],
    evidenceLink: ['server-logs', 'access-card-logs', 'financial-records']
  },
  {
    id: 'marc-dubois',
    name: 'Marc Dubois',
    role: 'Responsable RH',
    motif: 'A des difficultés financières connues suite à son récent divorce.',
    notes: 'A accédé aux dossiers des employés de manière inhabituelle récemment.',
    suspicionLevel: 0,
    indicators: [
      'Comportement d\'accès aux fichiers inhabituel',
      'A consulté les dossiers d\'employés sans raison apparente',
      'Plusieurs retraits d\'argent récents'
    ],
    evidenceLink: ['server-logs', 'access-card-logs', 'financial-records']
  },
  {
    id: 'julie-leroy',
    name: 'Julie Leroy',
    role: 'Développeur Senior',
    motif: 'Mécontente de sa rémunération et a mentionné un concurrent dans un email.',
    notes: 'A exprimé son mécontentement concernant les bonus et mentionné NexGen Systems.',
    suspicionLevel: 0,
    indicators: [
      'A mentionné un concurrent direct (NexGen) dans un email',
      'Exprime son mécontentement sur sa rémunération',
      'Reçoit des virements d\'une source interne'
    ],
    evidenceLink: ['email-suspicious', 'financial-records']
  }
];

export default function DataLeakInvestigation() {
  const [timeRemaining, setTimeRemaining] = useState<number>(INITIAL_TIME);
  const [evidences, setEvidences] = useState<Evidence[]>(evidenceData);
  const [suspects, setSuspects] = useState<Suspect[]>(suspectData);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState<boolean>(false);
  const [suspectDialogOpen, setSuspectDialogOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [accusation, setAccusation] = useState<string | null>(null);
  const [accusationSubmitted, setAccusationSubmitted] = useState<boolean>(false);
  const [conclusionCorrect, setConclusionCorrect] = useState<boolean | null>(null);
  const [evidencesAnalyzed, setEvidencesAnalyzed] = useState<number>(0);
  const [docsOpen, setDocsOpen] = useState<boolean>(false);
  const [currentDocContext, setCurrentDocContext] = useState<string>("data_breach");
  
  // États pour le système d'apprentissage
  const [userActions, setUserActions] = useState<string[]>([]);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const [showDebriefing, setShowDebriefing] = useState<boolean>(false);
  
  // États pour le système d'évaluation par IA et progression
  const [currentLevel, setCurrentLevel] = useState<string>('Débutant');
  const [sessionId, setSessionId] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [noteEvaluation, setNoteEvaluation] = useState<any>(null);
  const [progressSaved, setProgressSaved] = useState<boolean>(false);
  
  // Initialiser l'ID de session et récupérer le niveau actuel
  useEffect(() => {
    // Récupérer ou générer un ID de session
    const storedSessionId = localStorage.getItem('dataLeakSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
      localStorage.setItem('dataLeakSessionId', newSessionId);
      setSessionId(newSessionId);
    }
    
    // Récupérer le niveau actuel
    const storedLevel = localStorage.getItem('dataLeakLevel');
    if (storedLevel) {
      setCurrentLevel(storedLevel);
    }
    
    // S'assurer qu'un userId existe
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', 'user_' + Date.now().toString());
    }
    
    // S'assurer qu'un userName existe
    if (!localStorage.getItem('userName')) {
      localStorage.setItem('userName', 'Utilisateur');
    }
  }, []);

  // Décompte du temps
  useEffect(() => {
    if (timeRemaining > 0 && !accusationSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, accusationSubmitted]);

  // Mise à jour du compteur d'analyse
  useEffect(() => {
    const count = evidences.filter(e => e.analyzed).length;
    setEvidencesAnalyzed(count);
  }, [evidences]);

  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Marquer une preuve comme analysée
  const markEvidenceAsAnalyzed = (id: string) => {
    setEvidences(evidences.map(evidence => 
      evidence.id === id ? { ...evidence, analyzed: true } : evidence
    ));
  };

  // Mise à jour du niveau de suspicion d'un suspect
  const updateSuspicionLevel = (id: string, level: number) => {
    setSuspects(suspects.map(suspect => 
      suspect.id === id ? { ...suspect, suspicionLevel: level } : suspect
    ));
  };

  // Accuser un suspect
  const accuseSuspect = async (id: string) => {
    setAccusation(id);
    setAccusationSubmitted(true);
    setIsEvaluating(true);
    
    // Dans ce cas, Sophie Mercier est la coupable
    const isCorrect = id === 'sophie-mercier';
    setConclusionCorrect(isCorrect);
    
    // Calculer le score de performance en fonction des preuves analysées et de l'exactitude de l'accusation
    const evidenceScore = Math.round((evidencesAnalyzed / evidences.length) * 50); // 50% du score basé sur les preuves
    const accusationScore = isCorrect ? 50 : 0; // 50% du score basé sur l'accusation
    const totalScore = evidenceScore + accusationScore;
    setPerformanceScore(totalScore);
    
    // Enregistrer l'accusation dans les actions de l'utilisateur
    const suspectName = suspects.find(s => s.id === id)?.name || id;
    setUserActions(prev => [...prev, `Accusation portée contre: ${suspectName}`]);
    
    // Identifier le suspect accusé pour l'IA
    const accusedSuspect = suspects.find(s => s.id === id);
    
    try {
      // Évaluer les notes avec l'IA si l'utilisateur en a pris
      if (notes.trim().length > 20) { // S'assurer qu'il y a suffisamment de contenu à évaluer
        const response = await fetch('/api/cyber-investigator/evaluate-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: localStorage.getItem('userId') || 'anonymous',
            userName: localStorage.getItem('userName') || 'Anonymous User',
            gameId: 'data-leak',
            currentLevel,
            notes,
            evidencesAnalyzed,
            totalEvidences: evidences.length,
            accusedSuspect: accusedSuspect?.name,
            correctSuspect: 'Sophie Mercier',
            suspects: suspects.map(s => ({ id: s.id, name: s.name, role: s.role, suspicionLevel: s.suspicionLevel })),
            sessionId
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.evaluation) {
            // Mettre à jour l'évaluation des notes
            setNoteEvaluation(result.evaluation);
            
            // Mettre à jour le niveau selon la recommandation de l'IA
            if (result.evaluation.progression.recommendedLevel) {
              const newLevel = result.evaluation.progression.recommendedLevel;
              setCurrentLevel(newLevel);
              localStorage.setItem('dataLeakLevel', newLevel);
            }
            
            setProgressSaved(true);
          }
        }
      } else {
        // Si pas suffisamment de notes, sauvegarder simplement le score
        await fetch('/api/cyber-investigator/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: localStorage.getItem('userId') || 'anonymous',
            userName: localStorage.getItem('userName') || 'Anonymous User',
            gameId: 'data-leak',
            currentLevel,
            score: totalScore,
            bestScore: totalScore,
            attempts: 1,
            sessionId
          }),
        });
        
        setProgressSaved(true);
      }
    } catch (error) {
      console.error('Erreur lors de l\'évaluation des notes:', error);
    } finally {
      setIsEvaluating(false);
    }
    
    // Afficher le débriefing
    setShowDebriefing(true);
  };

  // Afficher une preuve
  const viewEvidence = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setEvidenceDialogOpen(true);
    
    // Si la preuve n'a pas encore été analysée, la marquer comme telle et enregistrer l'action
    if (!evidence.analyzed) {
      markEvidenceAsAnalyzed(evidence.id);
      // Ajouter cette action à l'historique des actions de l'utilisateur
      setUserActions(prev => [...prev, `Analyse de la preuve: ${evidence.title}`]);
    }
  };

  // Afficher un suspect
  const viewSuspect = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
    setSuspectDialogOpen(true);
    
    // Enregistrer l'action pour le débriefing
    setUserActions(prev => [...prev, `Analyse du suspect: ${suspect.name}`]);
  };

  // Obtenir l'icône selon le type de preuve
  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5 text-blue-400" />;
      case 'log': return <FileText className="h-5 w-5 text-purple-400" />;
      case 'file': return <File className="h-5 w-5 text-yellow-400" />;
      case 'server': return <Server className="h-5 w-5 text-green-400" />;
      case 'chat': return <Mail className="h-5 w-5 text-pink-400" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  // Rendu de la page de résultat
  const renderResult = () => {
    const culprit = suspects.find(s => s.id === 'sophie-mercier');
    
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30 max-w-4xl mx-auto">
        {isEvaluating && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50 rounded-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-white text-lg">Évaluation de vos notes en cours...</p>
            <p className="text-indigo-300 text-sm mt-2">Notre IA analyse votre travail d'investigation</p>
          </div>
        )}
      
        <div className="flex items-center mb-6">
          {conclusionCorrect ? (
            <CheckCircle className="h-12 w-12 text-green-500 mr-4" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500 mr-4" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {conclusionCorrect 
                ? "Félicitations, enquête résolue !" 
                : "Conclusion incorrecte..."}
            </h2>
            <p className="text-indigo-200">
              {conclusionCorrect 
                ? "Vous avez correctement identifié le coupable." 
                : "Vous n'avez pas identifié le véritable coupable."}
            </p>
          </div>
        </div>
        
        <div className="bg-indigo-950/50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-white mb-2">La vérité sur cette fuite de données :</h3>
          <p className="text-indigo-200 mb-4">
            Sophie Mercier est bien responsable de la fuite des données du projet Quantum. Elle a accédé au serveur en dehors des heures de bureau, 
            téléchargé des fichiers confidentiels, et utilisé un accès exceptionnel à la salle des serveurs qu'elle a obtenu en falsifiant une autorisation.
          </p>
          <h4 className="text-md font-medium text-white mt-4 mb-2">Indices clés :</h4>
          <ul className="space-y-2 text-indigo-200">
            <li className="flex">
              <div className="text-indigo-400 mr-2">•</div>
              <span>Accès tardif aux serveurs (23h45) et téléchargement des fichiers confidentiels du projet Quantum</span>
            </li>
            <li className="flex">
              <div className="text-indigo-400 mr-2">•</div>
              <span>Accès à la salle des serveurs avec une autorisation falsifiée (le DSI affirme n'avoir jamais donné cette autorisation)</span>
            </li>
            <li className="flex">
              <div className="text-indigo-400 mr-2">•</div>
              <span>Dépôt bancaire suspect de 15 000€ peu après l'incident</span>
            </li>
            <li className="flex">
              <div className="text-indigo-400 mr-2">•</div>
              <span>Tentatives d'accès externe au réseau après son départ</span>
            </li>
          </ul>
        </div>
        
        {/* Évaluation des notes par l'IA */}
        {noteEvaluation && (
          <div className="bg-indigo-950/50 rounded-lg p-4 mb-6 border border-indigo-500/30">
            <h3 className="text-lg font-medium text-white mb-2 flex items-center">
              <div className="mr-2 p-1 bg-indigo-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="m16 16-4-4"/>
                  <path d="M22 12h-4"/>
                  <path d="M12 6V2"/>
                  <path d="m8 8-2-2"/>
                  <path d="M6 12H2"/>
                  <path d="m8 16-2 2"/>
                  <path d="M12 22v-4"/>
                  <path d="m16 20 2-2"/>
                  <path d="M20 12h2"/>
                  <path d="m14.5 9.5 3-3"/>
                </svg>
              </div>
              Évaluation de votre travail d'investigation
            </h3>
            
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-md font-medium text-indigo-300 mb-1">Analyse des notes</h4>
                <p className="text-gray-300">{noteEvaluation.analysis}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-indigo-300 mb-1">Points forts</h4>
                <ul className="space-y-1">
                  {noteEvaluation.strengths.map((strength: string, index: number) => (
                    <li key={`strength-${index}`} className="flex text-green-300">
                      <span className="mr-2">✓</span> {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-indigo-300 mb-1">Points à améliorer</h4>
                <ul className="space-y-1">
                  {noteEvaluation.weaknesses.map((weakness: string, index: number) => (
                    <li key={`weakness-${index}`} className="flex text-amber-300">
                      <span className="mr-2">→</span> {weakness}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-indigo-500/30 pt-4 mt-4">
                <h4 className="text-md font-medium text-white mb-2">Progression</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-300">Niveau actuel:</span>
                  <span className="font-medium text-indigo-300">{currentLevel}</span>
                </div>
                
                {noteEvaluation.progression.canProgress && noteEvaluation.progression.recommendedLevel !== currentLevel && (
                  <div className="bg-indigo-900/40 p-3 rounded-md border border-indigo-600/40">
                    <p className="text-green-300 font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                      </svg>
                      Progression débloquée !
                    </p>
                    <p className="text-white text-sm mt-1">
                      Félicitations ! Vous êtes prêt(e) à passer au niveau{' '}
                      <span className="font-medium text-indigo-300">{noteEvaluation.progression.recommendedLevel}</span>.
                    </p>
                  </div>
                )}
                
                {!noteEvaluation.progression.canProgress && (
                  <p className="text-amber-300 text-sm">
                    Pour progresser vers le niveau supérieur, continuez à pratiquer et à améliorer vos compétences d'analyse.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Débriefing pédagogique */}
        <div className="mt-6 mb-4">
          <DebriefingComponent 
            userActions={userActions}
            correctApproach={[
              "Analyser toutes les preuves avant de tirer des conclusions",
              "Porter attention aux incohérences (comme l'autorisation falsifiée)",
              "Identifier les indicateurs financiers suspects",
              "Vérifier les horodatages et la chronologie des événements"
            ]}
            scenario="data_breach"
            performanceScore={performanceScore}
          />
        </div>

        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setDocsOpen(true)}
            variant="outline" 
            className="border-indigo-500 text-indigo-200 hover:bg-indigo-900/30"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Documentation sur les fuites de données
          </Button>
        </div>
        
        <div className="flex justify-center mt-6">
          <Link href="/cyber/arcade/cyber-investigator">
            <Button variant="outline" className="mr-4 border-indigo-500 text-indigo-200 hover:bg-indigo-900/30">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
            </Button>
          </Link>
          <Link href="/cyber/arcade">
            <Button className="bg-indigo-700 hover:bg-indigo-800 text-white">
              Retour à Cyber Arcade
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <HomeLayout>
      <PageTitle title="Enquête - Fuite de Données" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
        {/* Documentation contextuelle */}
        <ContextualDocumentation 
          context="data_breach"
          isOpen={docsOpen}
          onClose={() => setDocsOpen(false)}
        />
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6">
          {!accusationSubmitted ? (
            <>
              {/* Header with timer */}
              <div className="flex justify-between items-center mb-6">
                <Link href="/cyber/arcade/cyber-investigator">
                  <Button variant="ghost" className="text-white hover:bg-indigo-800/20">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux enquêtes
                  </Button>
                </Link>
                <div className="flex items-center bg-gray-950/60 px-4 py-2 rounded-full border border-indigo-500/40">
                  <Clock className="h-5 w-5 text-indigo-400 mr-2" />
                  <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-400' : 'text-indigo-200'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              {/* Main investigation interface */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left sidebar - case info */}
                <Card className="bg-gray-900/60 border-gray-800 lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      Fuite de Données
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Difficulté: <span className="text-blue-400">Débutant</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-indigo-300 mb-1">Contexte</h3>
                      <p className="text-sm text-gray-300">
                        TechInnovate, une startup spécialisée en IA, a subi une fuite 
                        de données concernant son projet révolutionnaire "Quantum". 
                        Des informations confidentielles ont été transmises à son 
                        principal concurrent, NexGen Systems.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-indigo-300 mb-1">Votre mission</h3>
                      <p className="text-sm text-gray-300">
                        Enquêter sur cette violation et identifier le responsable parmi les employés suspects.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-indigo-300 mb-1">Progression</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Preuves analysées</span>
                            <span>{evidencesAnalyzed}/{evidences.length}</span>
                          </div>
                          <Progress value={(evidencesAnalyzed/evidences.length)*100} className="h-2 bg-gray-800" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white"
                      onClick={() => setActiveTab("conclusion")}
                      disabled={evidencesAnalyzed < 4}
                    >
                      {evidencesAnalyzed < 4 ? 
                        `Analysez au moins 4 preuves (${evidencesAnalyzed}/4)` : 
                        "Présenter vos conclusions"
                      }
                    </Button>
                  </CardFooter>
                </Card>

                {/* Main content area */}
                <div className="lg:col-span-3 space-y-6">
                  <Tabs 
                    defaultValue="overview" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="bg-gray-900/70 border border-gray-800 grid grid-cols-5 w-full">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-900/50">Vue d'ensemble</TabsTrigger>
                      <TabsTrigger value="evidences" className="data-[state=active]:bg-indigo-900/50">Preuves</TabsTrigger>
                      <TabsTrigger value="suspects" className="data-[state=active]:bg-indigo-900/50">Suspects</TabsTrigger>
                      <TabsTrigger value="notes" className="data-[state=active]:bg-indigo-900/50">Notes</TabsTrigger>
                      <TabsTrigger value="conclusion" className="data-[state=active]:bg-indigo-900/50" disabled={evidencesAnalyzed < 4}>Conclusion</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="m-0 mt-6">
                      <Card className="bg-gray-900/60 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-white">Rapport d'incident initial</CardTitle>
                          <CardDescription className="text-gray-400">
                            Informations préliminaires sur la violation
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="text-md font-medium text-white mb-2">Incident de sécurité - Résumé</h3>
                            <p className="text-gray-300 text-sm">
                              Ce matin (20/04/2025), le PDG de TechInnovate a été informé que des 
                              informations confidentielles sur le projet Quantum ont été divulguées. 
                              Notre concurrent NexGen Systems semble avoir obtenu des spécifications techniques 
                              détaillées et des informations de tarification qui n'étaient accessibles 
                              qu'à un nombre limité d'employés.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-950/60 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-indigo-300 mb-2">Données compromises</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                <li className="flex items-center">
                                  <div className="bg-red-900/40 p-1 rounded mr-2">
                                    <File className="h-3 w-3 text-red-400" />
                                  </div>
                                  Spécifications techniques (PDF)
                                </li>
                                <li className="flex items-center">
                                  <div className="bg-red-900/40 p-1 rounded mr-2">
                                    <File className="h-3 w-3 text-red-400" />
                                  </div>
                                  Informations de tarification (XLSX)
                                </li>
                                <li className="flex items-center">
                                  <div className="bg-red-900/40 p-1 rounded mr-2">
                                    <File className="h-3 w-3 text-red-400" />
                                  </div>
                                  Données clients potentiels
                                </li>
                              </ul>
                            </div>
                            <div className="bg-gray-950/60 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-indigo-300 mb-2">Chronologie initiale</h4>
                              <ul className="space-y-1 text-sm text-gray-300">
                                <li className="flex items-center">
                                  <div className="bg-indigo-900/40 p-1 rounded mr-2">
                                    <Clock className="h-3 w-3 text-indigo-400" />
                                  </div>
                                  19/04/2025 (soirée) - Probable moment de la fuite
                                </li>
                                <li className="flex items-center">
                                  <div className="bg-indigo-900/40 p-1 rounded mr-2">
                                    <Clock className="h-3 w-3 text-indigo-400" />
                                  </div>
                                  20/04/2025 (matin) - Découverte de la fuite
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-md font-medium text-white mb-2">Actions immédiates</h3>
                            <p className="text-gray-300 text-sm mb-3">
                              Le DSI a verrouillé temporairement les accès au dépôt de fichiers du 
                              projet Quantum et a lancé une analyse des journaux du serveur. Il a également 
                              demandé des relevés d'accès physiques au bâtiment sur les dernières 48 heures.
                            </p>
                            <p className="text-gray-300 text-sm">
                              Votre tâche est d'examiner toutes les preuves disponibles, d'évaluer les 
                              suspects potentiels et de déterminer qui est responsable de cette fuite de données.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Evidences Tab */}
                    <TabsContent value="evidences" className="m-0 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evidences.map((evidence) => (
                          <Card 
                            key={evidence.id} 
                            className={`bg-gray-900/60 border-gray-800 cursor-pointer transition-all hover:bg-gray-850/70 ${
                              evidence.analyzed ? 'border-l-4 border-l-green-500' : ''
                            }`}
                            onClick={() => viewEvidence(evidence)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-white text-lg flex items-center">
                                <div className="bg-gray-800 p-1.5 rounded mr-2">
                                  {getEvidenceIcon(evidence.type)}
                                </div>
                                {evidence.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                {evidence.timestamp && (
                                  <span className="text-xs">
                                    {evidence.timestamp}
                                  </span>
                                )}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <p className="text-gray-300 text-sm truncate">
                                {evidence.content.substring(0, 80)}...
                              </p>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <div className="flex flex-wrap gap-1">
                                {evidence.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="bg-indigo-900/40 text-indigo-300 text-xs px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Suspects Tab */}
                    <TabsContent value="suspects" className="m-0 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {suspects.map((suspect) => (
                          <Card 
                            key={suspect.id} 
                            className="bg-gray-900/60 border-gray-800 cursor-pointer transition-all hover:bg-gray-850/70"
                            onClick={() => viewSuspect(suspect)}
                          >
                            <CardHeader>
                              <CardTitle className="text-white text-lg flex items-center">
                                <div className="bg-gray-800 p-1.5 rounded-full mr-2">
                                  <User className="h-5 w-5 text-indigo-400" />
                                </div>
                                {suspect.name}
                              </CardTitle>
                              <CardDescription className="text-gray-400">
                                {suspect.role}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-indigo-300 mb-1">Motif potentiel</h4>
                                <p className="text-gray-300 text-sm">
                                  {suspect.motif}
                                </p>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-indigo-300">Niveau de suspicion</span>
                                  <span className="text-gray-400">{suspect.suspicionLevel}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={suspect.suspicionLevel}
                                  onChange={(e) => updateSuspicionLevel(suspect.id, parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <div className="text-xs text-gray-400 italic">
                                Cliquez pour voir les détails
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="m-0 mt-6">
                      <Card className="bg-gray-900/60 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-white">Notes d'enquête</CardTitle>
                          <CardDescription className="text-gray-400">
                            Conservez vos observations et théories ici
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Saisissez vos notes ici..."
                            className="w-full h-64 p-4 bg-gray-950/60 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Conclusion Tab */}
                    <TabsContent value="conclusion" className="m-0 mt-6">
                      <Card className="bg-gray-900/60 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-white">Présenter vos conclusions</CardTitle>
                          <CardDescription className="text-gray-400">
                            Basé sur votre enquête, identifiez le coupable
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <p className="text-gray-300 text-sm">
                            Après avoir analysé toutes les preuves, vous devez maintenant déterminer qui 
                            est responsable de la fuite de données du projet Quantum. Choisissez le suspect 
                            que vous considérez comme coupable, mais attention : vous n'aurez qu'une 
                            seule chance de présenter votre conclusion.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suspects.map((suspect) => (
                              <div 
                                key={suspect.id}
                                className={`relative p-4 border ${
                                  accusation === suspect.id 
                                    ? 'border-indigo-500 bg-indigo-900/30' 
                                    : 'border-gray-700 bg-gray-900/40'
                                } rounded-lg cursor-pointer hover:bg-gray-850/50 transition-all`}
                                onClick={() => setAccusation(suspect.id)}
                              >
                                <div className="text-center">
                                  <div className="bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-8 w-8 text-indigo-400" />
                                  </div>
                                  <h3 className="text-white font-medium mb-1">{suspect.name}</h3>
                                  <p className="text-gray-400 text-sm">{suspect.role}</p>
                                  
                                  <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-indigo-300">Niveau de suspicion</span>
                                      <span className="text-gray-400">{suspect.suspicionLevel}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                      <div 
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{ width: `${suspect.suspicionLevel}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button 
                            className="bg-red-700 hover:bg-red-800 text-white"
                            disabled={!accusation}
                            onClick={() => accuseSuspect(accusation!)}
                          >
                            Soumettre mon accusation
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              {/* Evidence Dialog */}
              <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                  {selectedEvidence && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <div className="bg-gray-800 p-1.5 rounded mr-2">
                            {getEvidenceIcon(selectedEvidence.type)}
                          </div>
                          {selectedEvidence.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {selectedEvidence.timestamp && (
                            <span>Horodaté: {selectedEvidence.timestamp}</span>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="font-mono bg-gray-950 p-4 rounded-md whitespace-pre-wrap text-sm text-gray-300 overflow-x-auto">
                        {selectedEvidence.content}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedEvidence.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-indigo-900/40 text-indigo-300 text-xs px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-indigo-700 hover:bg-indigo-800 text-white"
                          onClick={() => setEvidenceDialogOpen(false)}
                        >
                          Fermer
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
              
              {/* Suspect Dialog */}
              <Dialog open={suspectDialogOpen} onOpenChange={setSuspectDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                  {selectedSuspect && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          <div className="bg-gray-800 p-1.5 rounded-full mr-2">
                            <User className="h-5 w-5 text-indigo-400" />
                          </div>
                          {selectedSuspect.name}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {selectedSuspect.role}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-indigo-300 mb-1">Motif potentiel</h3>
                          <p className="text-gray-300">{selectedSuspect.motif}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-indigo-300 mb-1">Notes</h3>
                          <p className="text-gray-300">{selectedSuspect.notes}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-indigo-300 mb-1">Indicateurs suspects</h3>
                          <ul className="space-y-1 text-gray-300">
                            {selectedSuspect.indicators.map((indicator, index) => (
                              <li key={index} className="flex items-start">
                                <div className="text-indigo-400 mr-2">•</div>
                                <span>{indicator}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-indigo-300 mb-1">Niveau de suspicion</h3>
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Évaluez à quel point ce suspect est impliqué</span>
                              <span className="text-gray-400">{selectedSuspect.suspicionLevel}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={selectedSuspect.suspicionLevel}
                              onChange={(e) => updateSuspicionLevel(selectedSuspect.id, parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div className="text-xs text-gray-400">
                            {selectedSuspect.suspicionLevel < 25 && "Faible suspicion - Ce suspect semble peu impliqué"}
                            {selectedSuspect.suspicionLevel >= 25 && selectedSuspect.suspicionLevel < 50 && "Suspicion modérée - Des indices mais pas décisifs"}
                            {selectedSuspect.suspicionLevel >= 50 && selectedSuspect.suspicionLevel < 75 && "Forte suspicion - Des preuves significatives pointent vers ce suspect"}
                            {selectedSuspect.suspicionLevel >= 75 && "Très forte suspicion - Le principal suspect selon les preuves disponibles"}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-indigo-700 hover:bg-indigo-800 text-white"
                          onClick={() => setSuspectDialogOpen(false)}
                        >
                          Fermer
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          ) : (
            renderResult()
          )}
        </div>
      </div>
    </HomeLayout>
  );
}