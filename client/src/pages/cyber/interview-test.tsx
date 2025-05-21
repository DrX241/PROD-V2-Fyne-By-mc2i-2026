import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, TimerReset, 
  FileText, ClipboardPaste, Settings, BookOpen, Briefcase, FileCode, 
  FileQuestion, ShieldCheck, Info
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types de questions possibles
type QuestionType = 'presentation' | 'reflex' | 'incident' | 'analysis' | 'ethical' | 'client' | 'projection';

// Structure d'une question
interface Question {
  id: string;
  type: QuestionType;
  question: string;
  hint?: string;
  placeholder?: string;
}

// Structure pour les résultats d'évaluation
interface EvaluationResult {
  profile: string;
  strengths: string[];
  improvements: string[];
  badge: {
    name: string;
    justification: string;
  };
}

// Options de durée du test en minutes
type TestDuration = 3 | 5 | 10;

// État de test (en cours, terminé, etc.)
type TestState = 'intro' | 'in-progress' | 'submitting' | 'results';

// Liste des contextes d'audition prédéfinis
const PREDEFINED_CONTEXTS: JobContext[] = [
  {
    id: "rssi",
    title: "Responsable de la Sécurité des Systèmes d'Information (RSSI)",
    description: "Poste de RSSI au sein d'une entreprise du secteur bancaire",
    organization: "BanqueSecure, établissement financier de taille moyenne (2000 employés)",
    technicalContext: "Environnement hybride (cloud et on-premise), utilisation de technologies Microsoft, infrastructure critique soumise aux réglementations bancaires",
    responsibilities: [
      "Définir et piloter la stratégie de sécurité du SI",
      "Gérer les risques cyber et assurer la conformité réglementaire (RGPD, DSP2, etc.)",
      "Superviser la gestion des incidents de sécurité",
      "Animer la gouvernance de la sécurité et conseiller la direction générale",
      "Mettre en place un programme de sensibilisation à la cybersécurité"
    ],
    requirements: [
      "5+ ans d'expérience en cybersécurité, dont 3 ans à un poste de management",
      "Certification ISO 27001 Lead Implementer, CISSP ou équivalent",
      "Expérience en gestion de crise cyber",
      "Connaissance du secteur bancaire et de ses réglementations",
      "Compétences en leadership et communication"
    ]
  },
  {
    id: "consultant",
    title: "Consultant(e) Cybersécurité Senior",
    description: "Poste de consultant(e) senior au sein d'un cabinet de conseil IT",
    organization: "CyberConsult, cabinet de conseil en cybersécurité (250 consultants)",
    technicalContext: "Missions variées auprès de clients de différents secteurs, audits techniques et organisationnels, tests d'intrusion, accompagnement SOC/CERT",
    responsibilities: [
      "Réaliser des missions d'audit de sécurité (techniques et organisationnels)",
      "Mener des analyses de risques cyber pour les clients",
      "Accompagner les clients dans la mise en place de leur stratégie de sécurité",
      "Réaliser des tests d'intrusion et security reviews",
      "Participer au développement commercial et à la rédaction de propositions"
    ],
    requirements: [
      "4+ ans d'expérience en cybersécurité, idéalement en cabinet de conseil",
      "Certifications techniques (CEH, OSCP) et/ou organisationnelles (ISO 27001)",
      "Expérience en tests d'intrusion et/ou audits de sécurité",
      "Excellentes compétences en communication et rédaction",
      "Maîtrise de l'anglais professionnel"
    ]
  },
  {
    id: "pentester",
    title: "Pentester / Ethical Hacker",
    description: "Poste de testeur d'intrusion au sein d'une équipe offensive security",
    organization: "SecureOffense, entreprise spécialisée dans les services de cybersécurité offensifs",
    technicalContext: "Tests d'intrusion (web, mobile, infrastructure, IoT), red teaming, recherche de vulnérabilités, simulations d'attaques avancées",
    responsibilities: [
      "Réaliser des tests d'intrusion sur applications web, mobiles et infrastructures",
      "Effectuer des opérations de red teaming et simulations d'attaques ciblées",
      "Identifier, analyser et documenter les vulnérabilités découvertes",
      "Rédiger des rapports détaillés avec recommandations",
      "Contribuer à l'amélioration des méthodologies internes de tests"
    ],
    requirements: [
      "3+ ans d'expérience en tests d'intrusion",
      "Certifications techniques (OSCP, OSCE, OSWE ou équivalent)",
      "Maîtrise des outils de pentest et des techniques d'exploitation",
      "Connaissance des langages de programmation et scripting",
      "Esprit méthodique et sens éthique"
    ]
  },
  {
    id: "soc-analyst",
    title: "Analyste SOC",
    description: "Poste d'analyste au sein d'un Centre Opérationnel de Sécurité",
    organization: "IndustriSecure, entreprise industrielle majeure avec SOC interne",
    technicalContext: "Environnement SOC avec technologies SIEM, EDR, NDR; supervision d'infrastructures IT et OT, utilisation de playbooks d'incident",
    responsibilities: [
      "Surveiller et analyser les alertes de sécurité en temps réel",
      "Qualifier et investiguer les incidents de sécurité détectés",
      "Prendre les mesures appropriées selon les procédures définies",
      "Documenter les incidents et contribuer à l'amélioration des processus",
      "Participer à la veille sur les menaces et vulnérabilités"
    ],
    requirements: [
      "2+ ans d'expérience en cybersécurité opérationnelle",
      "Compétences en analyse de logs et détection d'intrusion",
      "Connaissance des techniques d'attaque et IoCs",
      "Expérience avec les outils SIEM (Splunk, QRadar, etc.)",
      "Capacité à travailler en équipe et sous pression"
    ]
  }
];

// Liste des questions possibles
const QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'presentation',
    question: 'Présente-toi en tant que professionnel de la cybersécurité.',
    hint: 'Décris ton parcours, tes compétences et ton rôle actuel ou souhaité.'
  },
  {
    id: 'q2',
    type: 'reflex',
    question: 'Un mail suspect arrive dans ta boîte de réception professionnelle. Quelles sont tes 3 premières actions ?',
    hint: 'Pense à la séquence d\'actions et aux précautions à prendre.'
  },
  {
    id: 'q3',
    type: 'incident',
    question: 'Une attaque par ransomware vient de bloquer 3 serveurs critiques de l\'entreprise. Que fais-tu dans la première heure ?',
    hint: 'Pense à la gestion de crise immédiate, aux communications et aux actions techniques.'
  },
  {
    id: 'q4',
    type: 'analysis',
    question: 'Voici un extrait de logs de connexion suspects :\n\n192.168.1.25 - - [03/May/2025:02:14:12 +0100] "GET /admin/login.php HTTP/1.1" 200 4523\n192.168.1.25 - - [03/May/2025:02:14:15 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n192.168.1.25 - - [03/May/2025:02:14:18 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n192.168.1.25 - - [03/May/2025:02:14:19 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n...(20 entrées similaires)...\n192.168.1.25 - - [03/May/2025:02:15:32 +0100] "POST /admin/login.php HTTP/1.1" 302 0\n192.168.1.25 - - [03/May/2025:02:15:33 +0100] "GET /admin/dashboard.php HTTP/1.1" 200 18345\n\nIdentifie et explique ce que tu observes.',
    hint: 'Recherche des motifs, des anomalies ou des indicateurs de comportement suspect.'
  },
  {
    id: 'q5',
    type: 'ethical',
    question: 'Lors d\'un audit, tu identifies une faille de sécurité critique qui a été passée sous silence par ton supérieur. Quelle est ta réaction ?',
    hint: 'Réfléchis aux dimensions éthiques, légales et professionnelles de la situation.'
  },
  {
    id: 'q6',
    type: 'client',
    question: 'Un client refuse d\'implémenter une bonne pratique de sécurité essentielle pour des raisons de coût. Comment gères-tu cette situation ?',
    hint: 'Pense à l\'équilibre entre pédagogie, argumentation et prise en compte des contraintes du client.'
  },
  {
    id: 'q7',
    type: 'projection',
    question: 'Quelle est la menace cyber qui t\'inquiète le plus pour les 3 prochaines années et pourquoi ?',
    hint: 'Tu peux évoquer des tendances technologiques, géopolitiques ou sociétales.'
  }
];

// Récupère uniquement la question de présentation
const getInitialQuestion = (): Question[] => {
  const presentationQuestion = QUESTIONS.find(q => q.type === 'presentation');

  return presentationQuestion ? [presentationQuestion] : [QUESTIONS[0]];
};

// Génère une question adaptative basée sur les réponses précédentes
const generateAdaptiveQuestion = async (
  presentationAnswer: string,
  currentQuestionIndex: number,
  previousAnswers: Array<{
    questionId: string;
    type: QuestionType;
    question: string;
    answer: string;
  }>
): Promise<Question | null> => {
  try {
    const response = await fetch('/api/cyber/interview-test/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentationAnswer,
        currentQuestionIndex,
        previousAnswers,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la question adaptative');
    }

    const data = await response.json();

    if (data.success) {
      return data.question;
    } else {
      throw new Error(data.message || 'Erreur lors de la génération de la question');
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

export default function CyberInterviewTest() {
  const [testState, setTestState] = useState<TestState>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [testDuration, setTestDuration] = useState<TestDuration>(10); // Durée par défaut: 10 minutes
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes en secondes par défaut
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation du test
  useEffect(() => {
    if (testState === 'intro') {
      // Réinitialiser les états au démarrage
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCurrentAnswer('');
      setTimeLeft(testDuration * 60); // Conversion en secondes basée sur la durée sélectionnée
      setEvaluationResult(null);
    } else if (testState === 'in-progress' && questions.length === 0) {
      // Commencer par la question de présentation uniquement
      setQuestions(getInitialQuestion());
    }
  }, [testState, testDuration]);

  // Gestion du timer
  useEffect(() => {
    if (testState === 'in-progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Temps écoulé
            clearInterval(timerRef.current!);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testState]);

  // Formatage du temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Démarrer le test
  const handleStartTest = () => {
    setTestState('in-progress');
  };

  // Passer à la question suivante ou générer une nouvelle question adaptative
  const handleNextQuestion = async () => {
    // Pour éviter les doubles clics
    if (isLoadingNextQuestion) return;
    
    // Vérifier si la réponse est intelligible
    if (currentAnswer.trim().length < 10) {
      toast({
        title: "Réponse trop courte",
        description: "Veuillez fournir une réponse plus détaillée.",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que la réponse a du sens et n'est pas juste du texte aléatoire
    const wordsCount = currentAnswer.trim().split(/\s+/).length;
    if (wordsCount < 5) {
      toast({
        title: "Réponse insuffisante",
        description: "Votre réponse ne semble pas être complète. Veuillez élaborer davantage.",
        variant: "destructive"
      });
      return;
    }
    
    // Analyse de la pertinence de la réponse par rapport à la question posée
    const questionObj = questions[currentQuestionIndex];
    
    if (questionObj) {
      const lowerCaseAnswer = currentAnswer.toLowerCase();
      const lowerCaseQuestion = questionObj.question.toLowerCase();
      
      // Extraction des mots-clés de la question pour analyse de cohérence
      const questionKeywords = lowerCaseQuestion
        .replace(/[.,?!;:]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['comment', 'pourquoi', 'quelles', 'quels', 'cette', 'dans', 'avec', 'pour', 'votre'].includes(word));
      
      // Vérifier si la réponse contient des éléments de la question
      const questionRelevance = questionKeywords.some(keyword => lowerCaseAnswer.includes(keyword));
      
      // Vérifier si la réponse est pertinente pour la cybersécurité
      const cyberKeywords = [
        'sécurité', 'cyber', 'protection', 'menace', 'attaque', 'défense', 'réseau', 'vulnérabilité', 
        'hacker', 'pare-feu', 'malware', 'virus', 'données', 'confidentialité', 'authentification', 
        'autorisation', 'cryptage', 'risque', 'serveur', 'politique', 'conformité', 'intrusion',
        'phishing', 'ransomware', 'détection', 'prévention', 'pentest', 'audit', 'soc', 'cert',
        'incident', 'réponse', 'crise', 'communication', 'analyse', 'forensic', 'supervision'
      ];
      
      // Mots-clés spécifiques par type de question
      const typeSpecificKeywords: Record<string, string[]> = {
        'presentation': ['expérience', 'parcours', 'compétence', 'formation', 'rôle', 'poste', 'métier', 'cybersécurité'],
        'reflex': ['vérifier', 'analyser', 'isoler', 'rapport', 'signaler', 'email', 'phishing', 'suspicion'],
        'incident': ['isoler', 'contenir', 'analyser', 'communication', 'sauvegarde', 'restauration', 'ransomware', 'forensic'],
        'analysis': ['log', 'connexion', 'tentative', 'intrusion', 'brute force', 'admin', 'authentification', 'dashboard'],
        'ethical': ['rapport', 'signaler', 'responsabilité', 'disclosure', 'hiérarchie', 'éthique', 'légal', 'confidentiel'],
        'client': ['conseil', 'risque', 'conformité', 'impact', 'business', 'retour', 'investissement', 'sensibilisation'],
        'projection': ['futur', 'menace', 'évolution', 'tendance', 'intelligence', 'artificielle', 'quantique', 'prédiction']
      };
      
      // Vérifier si au moins un mot-clé lié à la cybersécurité est présent
      const hasCyberSecurityTerms = cyberKeywords.some(keyword => lowerCaseAnswer.includes(keyword));
      
      // Vérifier la pertinence par rapport au type de question
      const hasTypeSpecificTerms = questionObj.type && typeSpecificKeywords[questionObj.type]
        ? typeSpecificKeywords[questionObj.type].some(keyword => lowerCaseAnswer.includes(keyword))
        : false;
        
      // Analyse multi-critères de pertinence
      const isRelevantAnswer = questionRelevance || hasCyberSecurityTerms || hasTypeSpecificTerms;
      
      // Si la réponse semble hors sujet après analyse approfondie
      if (wordsCount > 15 && !isRelevantAnswer) {
        toast({
          title: "Réponse hors sujet",
          description: "Votre réponse ne semble pas répondre directement à la question posée. Veuillez rester cohérent avec le contexte de la question.",
          variant: "destructive"
        });
        return;
      }
      
      // Pour les questions techniques, vérifier un minimum de qualité technique et de profondeur
      if (questionObj.type === 'analysis' || questionObj.type === 'incident') {
        const technicalKeywords = [
          'protocole', 'log', 'serveur', 'firewall', 'ip', 'http', 'code', 'administration', 
          'authentification', 'accès', 'service', 'système', 'fichier', 'base de données', 
          'sauvegarde', 'isolation', 'forensic', 'preuve', 'analyse', 'trafic', 'port',
          '401', '200', '302', 'post', 'get', 'login.php', 'dashboard', 'bruteforce'
        ];
        
        const hasTechnicalTerms = technicalKeywords.some(keyword => lowerCaseAnswer.includes(keyword));
        
        // Pour l'analyse de logs, vérifier si la réponse mentionne des éléments spécifiques du log
        if (questionObj.type === 'analysis' && lowerCaseQuestion.includes('extrait de logs')) {
          const logSpecificTerms = ['401', 'erreur', 'unauthorize', 'tentative', 'connexion', 'login', 'dashboard'];
          const hasLogSpecificTerms = logSpecificTerms.some(term => lowerCaseAnswer.includes(term));
          
          if (!hasLogSpecificTerms) {
            toast({
              title: "Analyse insuffisante",
              description: "Votre réponse ne semble pas analyser les éléments spécifiques présents dans les logs fournis.",
              variant: "destructive"
            });
            return;
          }
        }
        
        if (wordsCount > 20 && !hasTechnicalTerms) {
          toast({
            title: "Manque de précision technique",
            description: "Votre réponse manque de termes techniques pertinents pour ce type de question. Soyez plus précis et utilisez la terminologie appropriée.",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    // Activer l'indicateur de chargement pour éviter les clics multiples
    setIsLoadingNextQuestion(true);
    
    // Sauvegarder la réponse actuelle
    const updatedAnswers = {
      ...answers,
      [questions[currentQuestionIndex].id]: currentAnswer
    };
    setAnswers(updatedAnswers);

    // Si c'est la 10ème question (index 9), on termine le test
    if (currentQuestionIndex >= 9) {
      handleSubmitTest();
      return;
    }

    // Si on a déjà une question suivante chargée, on y passe simplement
    // Cela devrait être instantané, pas besoin d'attendre
    if (currentQuestionIndex < questions.length - 1) {
      // Préchargement pour éviter tout délai perceptible
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setIsLoadingNextQuestion(false);
      }, 10); // Délai minimal pour la transition visuelle
      return;
    }

    // Sinon, on doit générer une nouvelle question adaptative
    try {
      // Construction des précédentes réponses pour l'API
      const presentationAnswer = updatedAnswers[questions[0].id] || currentAnswer;
      const previousAnswers = questions.map((q, index) => ({
        questionId: q.id,
        type: q.type,
        question: q.question,
        answer: index === currentQuestionIndex ? currentAnswer : updatedAnswers[q.id] || ''
      }));

      // Promesse pour obtenir une nouvelle question adaptative
      // Avec un timeout pour limiter l'attente
      const questionPromise = generateAdaptiveQuestion(
        presentationAnswer,
        currentQuestionIndex,
        previousAnswers
      );
      
      // Ajouter un délai maximum de 3 secondes
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });
      
      // Utiliser la première promesse qui se résout
      const nextQuestion = await Promise.race([questionPromise, timeoutPromise]);

      if (nextQuestion) {
        // Ajouter la nouvelle question à notre liste
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
      } else {
        // En cas d'erreur ou de timeout, utiliser une question de secours
        // Sélectionner une question d'un type différent de celles déjà posées
        const usedTypes = questions.map(q => q.type);
        const fallbackQuestion = QUESTIONS.find(q => 
          !usedTypes.includes(q.type)
        ) || QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

        setQuestions(prev => [...prev, fallbackQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de question:', error);
      
      // En cas d'erreur, utiliser une question de secours sans notifier l'utilisateur
      // pour ne pas interrompre son expérience
      const usedTypes = questions.map(q => q.type);
      const fallbackQuestion = QUESTIONS.find(q => 
        !usedTypes.includes(q.type)
      ) || QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

      setQuestions(prev => [...prev, fallbackQuestion]);
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    } finally {
      // Dans tous les cas, désactiver l'indicateur de chargement
      setIsLoadingNextQuestion(false);
    }
  };

  // Soumettre le test pour évaluation
  const handleSubmitTest = async () => {
    // Sauvegarder la dernière réponse si pas déjà fait
    const finalAnswers = { ...answers };
    if (currentQuestionIndex < questions.length) {
      finalAnswers[questions[currentQuestionIndex].id] = currentAnswer;
    }

    setTestState('submitting');
    setIsSubmitting(true);

    try {
      // Instructions d'évaluation objective pour l'IA avec exigence d'exemples concrets pour chaque observation
      const objectiveInstructions = {
        evaluationGuidelines: {
          objectivity: "Évaluer de manière strictement factuelle les réponses en fonction de leur pertinence technique et professionnelle",
          accuracy: "Éviter toute surestimation des compétences, ne pas inventer de forces ou qualités non démontrées dans les réponses",
          specificity: "Baser CHAQUE observation sur des extraits précis ou des éléments concrets présents dans les réponses",
          balance: "Présenter à la fois les forces démontrées et les domaines d'amélioration avec la même rigueur, sans enjoliver",
          factualFeedback: "Se concentrer sur la qualité technique des réponses (précision, pertinence, exhaustivité)",
          responseQuality: "Évaluer objectivement la maturité technique, la structure des réponses, la posture professionnelle",
          negativeFeatures: "Mentionner explicitement les lacunes techniques, les imprécisions et les faiblesses constatées",
          concreteMetrics: "Fournir une évaluation chiffrée (pourcentage) de la qualité objective des réponses techniques",
          technicalDepth: "Évaluer la profondeur technique des réponses sans complaisance",
          professionalStance: "Analyser la posture professionnelle sans idéalisation",
          evidence: "Pour CHAQUE point fort ou axe d'amélioration cité, fournir OBLIGATOIREMENT une citation exacte ou un exemple concret tiré des réponses",
          analytical: "Présenter une analyse critique et non une simple description des réponses",
          citations: "Format requis pour les citations : 'Par exemple, quand vous dites \"[citation exacte]\"...'",
          negativeBias: "Mettre l'accent sur les faiblesses pour garantir une évaluation rigoureuse",
          clarity: "Éviter les généralités et les formulations vagues qui pourraient s'appliquer à n'importe quel candidat"
        },
        strengthsFormat: [
          "Chaque force doit être présentée sous la forme: '[Force spécifique] : Exemple tiré de vos réponses : \"[citation exacte]\"'",
          "Maximum 5 forces, uniquement celles explicitement démontrées dans les réponses",
          "Ne pas enjoliver ou extrapoler au-delà de ce qui est clairement démontré",
          "Inclure une notation de pertinence technique pour chaque force (faible/moyenne/élevée)"
        ],
        improvementsFormat: [
          "Chaque axe d'amélioration doit être présenté sous la forme: '[Domaine à améliorer] : Constat basé sur votre réponse : \"[citation problématique ou manquante]\"'",
          "Minimum 5 axes d'amélioration, couvrant différents aspects techniques et méthodologiques",
          "Être direct et factuel sur les lacunes observées",
          "Ne pas atténuer les critiques par politesse"
        ],
        evaluationCategories: [
          "Précision technique", 
          "Complétude des réponses", 
          "Maturité professionnelle", 
          "Structure et clarté", 
          "Pertinence cybersécurité",
          "Rigueur méthodologique",
          "Prise en compte des contraintes",
          "Points faibles identifiés",
          "Niveau de détail technique",
          "Cohérence méthodologique"
        ]
      };

      // Préparer les données à envoyer
      const submissionData = {
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question
        })),
        answers: Object.keys(finalAnswers).map(qId => ({
          questionId: qId,
          answer: finalAnswers[qId]
        })),
        evaluationOptions: objectiveInstructions,
        testDuration: testDuration // Envoi de la durée du test choisie
      };

      // Appel API pour l'évaluation
      const response = await fetch('/api/cyber/interview-test/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation du test');
      }

      const data = await response.json();

      if (data.success) {
        setEvaluationResult(data.evaluation);
        setTestState('results');
      } else {
        throw new Error(data.message || 'Erreur lors de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'évaluation de votre test. Veuillez réessayer.',
        variant: 'destructive',
      });
      
      // Revenir à l'écran d'introduction en cas d'erreur prolongée
      setTimeout(() => {
        if (isSubmitting) {
          setTestState('intro');
          setIsSubmitting(false);
          toast({
            title: 'Session réinitialisée',
            description: 'La session a été réinitialisée en raison d\'un problème de connexion.',
            variant: 'default',
          });
        }
      }, 15000); // Attendre 15 secondes avant de réinitialiser
    } finally {
      // Ne pas désactiver isSubmitting ici pour permettre l'affichage du chargement
      // Il sera désactivé lorsque le résultat sera affiché ou après le timeout
    }
  };

  // Retour à l'accueil
  const handleBackToHome = () => {
    navigate('/cyber');
  };

  // Calculer la progression (6 questions au total)
  const totalQuestions = 10;
  const progress = testState === 'in-progress' 
    ? Math.min(((currentQuestionIndex + 1) / totalQuestions) * 100, 100)
    : 100;

  // Affichage de l'introduction du test
  if (testState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
        <div className="container mx-auto py-8 px-4 cyber-interview-test">
          <div className="flex items-center mb-8">
            <Link href="/cyber/roleplay">
              <Button variant="ghost" className="text-white mr-4">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour aux jeux de rôle
              </Button>
            </Link>
            <h1 className="text-3xl font-bold font-[Rajdhani] tracking-wide text-white">TEST D'ENTRETIEN CYBERSÉCURITÉ</h1>
          </div>
          <Card className="max-w-3xl mx-auto bg-blue-900/30 border-blue-800">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-white font-[Rajdhani]">Test d'entretien cybersécurité</CardTitle>
              <CardDescription className="text-center text-blue-100 text-lg mt-2">
                Évaluez objectivement vos compétences techniques et fonctionnelles en cybersécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-800 p-5 rounded-md">
                <h3 className="font-semibold mb-3 flex items-center text-white text-lg">
                  <Clock className="h-5 w-5 mr-2 text-blue-300" />
                  Comment ça fonctionne
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-100">
                  <li>Test chronométré adapté à vos disponibilités (durée à choisir ci-dessous)</li>
                  <li>10 questions ouvertes mêlant aspects techniques et fonctionnels</li>
                  <li>Répondez à chaque question de façon concise mais détaillée</li>
                  <li>L'IA évalue la qualité et la pertinence de vos réponses en temps réel</li>
                  <li>À la fin, vous recevrez une analyse objective de vos compétences, forces et axes d'amélioration</li>
                </ul>
              </div>

              {/* Sélection de la durée */}
              <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-600/50 p-5 rounded-md">
                <h3 className="font-semibold mb-3 flex items-center text-white text-lg">
                  <TimerReset className="h-5 w-5 mr-2 text-blue-300" />
                  Choisissez la durée du test
                </h3>
                <div className="grid grid-cols-3 gap-3 my-3">
                  <Button 
                    variant={testDuration === 3 ? "default" : "outline"}
                    className={testDuration === 3 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                      : "border-blue-500/50 text-blue-200 hover:bg-blue-800/30"}
                    onClick={() => setTestDuration(3)}
                  >
                    3 minutes
                  </Button>
                  <Button 
                    variant={testDuration === 5 ? "default" : "outline"}
                    className={testDuration === 5 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                      : "border-blue-500/50 text-blue-200 hover:bg-blue-800/30"}
                    onClick={() => setTestDuration(5)}
                  >
                    5 minutes
                  </Button>
                  <Button 
                    variant={testDuration === 10 ? "default" : "outline"}
                    className={testDuration === 10 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                      : "border-blue-500/50 text-blue-200 hover:bg-blue-800/30"}
                    onClick={() => setTestDuration(10)}
                  >
                    10 minutes
                  </Button>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  Durée sélectionnée: <span className="font-semibold text-blue-300">{testDuration} minutes</span> - {testDuration === 3 ? "Idéal pour un test rapide" : testDuration === 5 ? "Recommandé pour une évaluation standard" : "Parfait pour une évaluation approfondie"}
                </p>
              </div>

              <div className="bg-blue-900/50 backdrop-blur-sm border border-amber-800/50 p-5 rounded-md">
                <h3 className="font-semibold mb-3 flex items-center text-white text-lg">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-400" />
                  À savoir avant de commencer
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-100">
                  <li>Le test sera chronométré dès que vous cliquerez sur "Commencer"</li>
                  <li>Vous ne pourrez pas revenir à une question précédente</li>
                  <li>Si le temps s'écoule, vos réponses seront automatiquement soumises</li>
                  <li>Fournissez des réponses complètes et pertinentes pour obtenir une meilleure évaluation</li>
                  <li>L'IA détectera les réponses hors-sujet ou sans cohérence avec le domaine de la cybersécurité</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handleBackToHome} 
                variant="outline"
                className="gap-2 border-blue-700 text-white hover:bg-blue-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à I AM CYBER
              </Button>
              <Button 
                size="lg" 
                onClick={handleStartTest}
                className="md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Commencer le test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Affichage des résultats
  if (testState === 'results' && evaluationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
        <div className="container mx-auto py-8 px-4 cyber-interview-test">
          <div className="flex items-center mb-8">
            <Link href="/cyber">
              <Button variant="ghost" className="text-white mr-4">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold font-[Rajdhani] tracking-wide text-white">RÉSULTATS DU TEST</h1>
          </div>
          <Card className="max-w-3xl mx-auto bg-blue-900/30 border-blue-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white font-[Rajdhani]">Évaluation terminée</CardTitle>
              <CardDescription className="text-blue-100">
                Analyse de votre profil en cybersécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2 text-white">🧑‍💼 Profil évalué</h3>
                <p className="text-sm text-blue-100">{evaluationResult.profile}</p>
              </div>

              <div className="bg-blue-900/50 backdrop-blur-sm border border-green-800/50 p-4 rounded-md">
                <h3 className="font-semibold mb-2 flex items-center text-white">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                  Points forts identifiés
                </h3>
                <div className="space-y-3 text-sm text-blue-100">
                  {evaluationResult.strengths.map((strength, index) => (
                    <div key={index} className="border-l-2 border-green-500/50 pl-3 py-1">
                      <p dangerouslySetInnerHTML={{ __html: strength.replace(/\"(.*?)\"/g, '<span class="font-mono text-xs bg-blue-950/70 px-1 py-0.5 rounded">"$1"</span>') }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/50 backdrop-blur-sm border border-amber-800/50 p-4 rounded-md">
                <h3 className="font-semibold mb-2 flex items-center text-white">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-400" />
                  Axes de progression
                </h3>
                <div className="space-y-3 text-sm text-blue-100">
                  {evaluationResult.improvements.map((improvement, index) => (
                    <div key={index} className="border-l-2 border-amber-500/50 pl-3 py-1">
                      <p dangerouslySetInnerHTML={{ __html: improvement.replace(/\"(.*?)\"/g, '<span class="font-mono text-xs bg-blue-950/70 px-1 py-0.5 rounded">"$1"</span>') }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/50 backdrop-blur-sm border border-purple-800/50 p-4 rounded-md">
                <h3 className="font-semibold mb-2 text-white">🎖️ Badge attribué</h3>
                <Badge className="mb-2 bg-indigo-600 hover:bg-indigo-700">{evaluationResult.badge.name}</Badge>
                <p className="text-sm text-blue-100">{evaluationResult.badge.justification}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={handleBackToHome} 
                className="w-full md:w-auto gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Affichage de la soumission en cours
  if (testState === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[50vh] cyber-interview-test">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-400 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-white font-[Rajdhani]">Analyse en cours...</h2>
          <p className="text-blue-100 text-center max-w-md">
            Notre IA analyse vos réponses pour générer votre profil de compétences en cybersécurité.
            Cela peut prendre quelques instants.
          </p>
        </div>
      </div>
    );
  }

  // Affichage du test en cours
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      <div className="container mx-auto py-8 px-4 cyber-interview-test">
        <div className="flex items-center mb-8">
          <Link href="/cyber">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-[Rajdhani] tracking-wide text-white">TEST TECHNIQUE</h1>
        </div>
        <Card className="max-w-3xl mx-auto bg-blue-900/30 border-blue-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-white font-[Rajdhani]">
                  Question {currentQuestionIndex + 1}/{totalQuestions}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {questions[currentQuestionIndex]?.type === 'presentation' ? 'Présentation' : 
                   questions[currentQuestionIndex]?.type === 'reflex' ? 'Réflexes de sécurité' : 
                   questions[currentQuestionIndex]?.type === 'incident' ? 'Gestion d\'incident' : 
                   questions[currentQuestionIndex]?.type === 'analysis' ? 'Analyse technique' : 
                   questions[currentQuestionIndex]?.type === 'ethical' ? 'Éthique professionnelle' : 
                   questions[currentQuestionIndex]?.type === 'client' ? 'Relation client' : 
                   'Prospective'}
                </CardDescription>
              </div>
              <div className="flex items-center bg-blue-900/80 p-2 rounded-md text-white border border-blue-700">
                <Clock className="h-5 w-5 mr-2 text-amber-400" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-5 text-white">
            <div className="space-y-3 bg-blue-900/50 backdrop-blur-sm border border-blue-800 p-5 rounded-md">
              <h3 className="text-xl font-medium">{questions[currentQuestionIndex]?.question}</h3>
              {questions[currentQuestionIndex]?.hint && (
                <p className="text-sm text-blue-100 border-l-2 border-blue-400 pl-3 py-1">{questions[currentQuestionIndex]?.hint}</p>
              )}
            </div>
            <Textarea
              placeholder="Entrez votre réponse ici..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onPaste={(e) => {
                e.preventDefault();
                toast({
                  title: "Action interdite",
                  description: "Le copier-coller n'est pas autorisé durant ce test.",
                  variant: "destructive"
                });
              }}
              className="min-h-[200px] bg-blue-950/50 border-blue-700 text-white placeholder:text-blue-400 text-base p-4"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={handleBackToHome} 
              variant="outline"
              className="gap-2 border-blue-700 text-white hover:bg-blue-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à I AM CYBER
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={currentAnswer.trim().length < 5 || isLoadingNextQuestion}
              className={`${
                isLoadingNextQuestion 
                  ? 'bg-blue-700 opacity-80' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } min-w-[180px]`}
            >
              {isLoadingNextQuestion ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Chargement...
                </>
              ) : (
                <>
                  {currentQuestionIndex < totalQuestions - 1 ? 'Question suivante' : 'Terminer le test'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}