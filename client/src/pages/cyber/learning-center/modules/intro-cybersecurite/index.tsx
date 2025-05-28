import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Shield, Lock, Share2, Database, 
  Server, Cpu, Clock, Users, Code, FileCheck,
  ArrowRight, CheckCircle, AlertTriangle, 
  ExternalLink, Trophy, Award, Lightbulb as LightbulbIcon,
  BrainCircuit, GraduationCap, Brain, Sparkles, 
  MessageCircle, Monitor, Zap, Target, Info,
  Flame, Star, Eye, BookOpen, Mail, LinkIcon,
  FileText, Send, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function IntroductionCybersecurite() {
  // États pour suivre la progression et les interactions
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("principes");
  const [activeSubTab, setActiveSubTab] = useState("malware");
  const [showQuizResult, setShowQuizResult] = useState(false);
  
  // États pour le système de niveaux
  const [currentLevel, setCurrentLevel] = useState<'debutant' | 'intermediaire' | 'avance'>('debutant');
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contentKey, setContentKey] = useState(0); // Clé pour forcer le re-rendu
  const [quizAnswers, setQuizAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: ""
  });
  const [quizScored, setQuizScored] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [caseStudyExpanded, setCaseStudyExpanded] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [, setLocation] = useLocation();
  
  // État pour les détails techniques des cas
  const [showCaseTechnicalDetails, setShowCaseTechnicalDetails] = useState(false);
  
  // États pour les fonctionnalités interactives
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>([]);
  
  // État pour les mini-jeux disponibles
  const [selectedMiniGame, setSelectedMiniGame] = useState<string>("rssi");
  const miniGames = [
    { id: "rssi", name: "Vous êtes le RSSI", description: "Que feriez-vous à la place du responsable sécurité?" },
    { id: "scenario", name: "Scénario de crise", description: "Comment réagiriez-vous face à cette attaque?" },
    { id: "analyse", name: "Analyse technique", description: "Analysez les vecteurs d'attaque et les IOCs" }
  ];
  
  // États pour le chat avec l'IA dans les mini-jeux
  const [showMiniGameChat, setShowMiniGameChat] = useState(false);
  const [miniGameChatPrompt, setMiniGameChatPrompt] = useState("");
  const [miniGameChatResponse, setMiniGameChatResponse] = useState("");
  const [miniGameChatHistory, setMiniGameChatHistory] = useState<{role: string, content: string}[]>([]);
  const [isGeneratingMiniGameChat, setIsGeneratingMiniGameChat] = useState(false);
  const [showInteractiveExercise, setShowInteractiveExercise] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    passwordStrength: "",
    passwordFeedback: "",
    phishingDetected: false,
    phishingChecks: [] as string[],
    phishingFeedback: "",
    glossaryScore: 0,
    glossaryFeedback: "",
    securityAuditLevel: "",
    securityAuditFeedback: "",
    caseStudyAnalysis: "",
    caseStudyFeedback: ""
  });

  // État pour naviguer entre les exemples de phishing
  const [currentPhishingExample, setCurrentPhishingExample] = useState(0);

  // Collection de 5 exemples de phishing variés
  const phishingExamples = [
    {
      id: 1,
      title: "E-mail bancaire suspect",
      sender: "service-client@bankingsecure-alert.com",
      recipient: "client@exemple.fr",
      subject: "URGENT: Votre compte a été suspendu - Action immédiate requise",
      body: `Cher(e) Client(e),

Nous avons détecté une activité inhabituelle sur votre compte. Pour des raisons de sécurité, nous avons temporairement suspendu votre accès.

Veuillez cliquer ici pour vérifier votre identité et réactiver votre compte immédiatement. Faute de quoi, votre compte sera définitivement fermé dans les 24 heures.

ID de référence: REF-2025-05-25-78392

Département de Sécurité
Banque Nationale`,
      correctFlags: ['sender', 'urgency', 'generic', 'link', 'vague'],
      wrongFlags: ['spelling', 'attachment']
    },
    {
      id: 2,
      title: "Fausse notification de livraison",
      sender: "noreply@delivery-express24.com",
      recipient: "client@exemple.fr",
      subject: "Votre colis ne peut pas être livré - Confirmez votre adresse",
      body: `Bonjour,

Votre colis avec le numéro de suivi DX7891234 ne peut pas être livré à votre adresse actuelle.

Cliquez sur le lien ci-dessous pour mettre à jour vos informations de livraison dans les 48h, sinon votre colis sera retourné à l'expéditeur.

👉 Confirmer mon adresse maintenant

Service Client Express Delivery
Note: Ne répondez pas à cet e-mail, cette boîte n'est pas surveillée.`,
      correctFlags: ['sender', 'urgency', 'link', 'fake_tracking'],
      wrongFlags: ['spelling', 'official_domain', 'attachment']
    },
    {
      id: 3,
      title: "Fausse alerte de sécurité Microsoft",
      sender: "security-alerts@microsoft-protection.net",
      recipient: "utilisateur@entreprise.fr",
      subject: "Alerte de sécurité: Tentative de connexion suspecte détectée",
      body: `Bonjour,

Nous avons détecté une tentative de connexion suspecte sur votre compte Microsoft depuis une adresse IP inconnue (192.168.1.100 - Russie).

Pour sécuriser votre compte immédiatement:
• Cliquez ici pour vérifier votre identité
• Changez votre mot de passe dans les 2 heures
• Activez la vérification en deux étapes

Si cette connexion n'était pas de vous, votre compte pourrait être compromis.

Équipe de sécurité Microsoft`,
      correctFlags: ['sender', 'urgency', 'fake_ip', 'generic'],
      wrongFlags: ['spelling', 'official_domain', 'attachment']
    },
    {
      id: 4,
      title: "Offre promotionnelle suspecte Amazon",
      sender: "promotions@amazon-deals-center.org",
      recipient: "client@exemple.fr",
      subject: "🎉 Félicitations! Vous avez gagné un iPhone 15 Pro - Réclamez maintenant",
      body: `Chère/Cher gagnant(e),

Félicitations! Vous avez été sélectionné(e) pour recevoir un iPhone 15 Pro GRATUIT dans le cadre de notre programme de fidélité.

Pour récupérer votre prix:
1. Cliquez sur le lien de validation ci-dessous
2. Entrez vos informations personnelles
3. Payez uniquement les frais de livraison (9,99€)

⚠️ Attention: Cette offre expire dans 24 heures!

RÉCLAMER MON IPHONE MAINTENANT

Amazon Customer Service`,
      correctFlags: ['sender', 'too_good', 'payment_request', 'urgency', 'generic'],
      wrongFlags: ['spelling', 'official_domain']
    },
    {
      id: 5,
      title: "Fausse notification PayPal",
      sender: "service@paypal-secure-center.com",
      recipient: "utilisateur@exemple.fr",
      subject: "Limitation de compte - Vérification requise",
      body: `Cher utilisateur PayPal,

Votre compte PayPal a été temporairement limité en raison d'une activité inhabituelle. Nous avons remarqué des tentatives de connexion depuis plusieurs pays différents.

Pour lever cette limitation:
- Connectez-vous à votre compte PayPal
- Vérifiez vos informations bancaires
- Confirmez votre identité avec une pièce d'identité

Votre compte restera limité jusqu'à ce que ces étapes soient complétées.

Centre de sécurité PayPal
Copyright © 2025 PayPal. Tous droits réservés.`,
      correctFlags: ['sender', 'account_limitation', 'vague', 'identity_request'],
      wrongFlags: ['spelling', 'urgency', 'official_domain']
    }
  ];

  // Type pour les clés des indices de phishing
  type PhishingFlagKey = 'sender' | 'urgency' | 'generic' | 'link' | 'vague' | 'too_good' | 'payment_request' | 'fake_tracking' | 'fake_ip' | 'account_limitation' | 'identity_request' | 'spelling' | 'attachment' | 'official_domain';

  // Définition des indices possibles avec vrais et faux
  const phishingFlags: Record<PhishingFlagKey, { label: string; description: string; isCorrect: boolean }> = {
    // Indices corrects (vraies caractéristiques de phishing)
    sender: { label: "Adresse e-mail de l'expéditeur suspecte", description: "L'adresse n'est pas un domaine officiel", isCorrect: true },
    urgency: { label: "Sentiment d'urgence créé artificiellement", description: "Expressions comme 'URGENT', 'immédiatement', 'dans les 24h'", isCorrect: true },
    generic: { label: "Salutation générique", description: "Utilise 'Cher(e) Client(e)' au lieu du nom réel", isCorrect: true },
    link: { label: "Liens suspects ou masqués", description: "Liens 'cliquer ici' sans URL visible", isCorrect: true },
    vague: { label: "Informations vagues sur l'activité suspecte", description: "Aucun détail précis sur les problèmes mentionnés", isCorrect: true },
    too_good: { label: "Offre trop belle pour être vraie", description: "Promesses de gains faciles ou cadeaux gratuits", isCorrect: true },
    payment_request: { label: "Demande de paiement pour 'frais'", description: "Demande de frais de livraison ou de traitement", isCorrect: true },
    fake_tracking: { label: "Numéro de suivi fictif", description: "Utilise des numéros de suivi qui semblent réels", isCorrect: true },
    fake_ip: { label: "Adresse IP douteuse dans l'alerte", description: "Mentionne des IPs privées comme venant de l'étranger", isCorrect: true },
    account_limitation: { label: "Fausse limitation de compte", description: "Prétend que le compte est suspendu ou limité", isCorrect: true },
    identity_request: { label: "Demande de documents d'identité", description: "Demande de fournir des pièces d'identité par e-mail", isCorrect: true },
    
    // Pièges (caractéristiques qui peuvent sembler suspectes mais ne le sont pas ici)
    spelling: { label: "Fautes d'orthographe importantes", description: "De nombreuses erreurs d'écriture dans le texte", isCorrect: false },
    attachment: { label: "Pièce jointe suspecte", description: "Fichier en pièce jointe de type .exe ou .zip", isCorrect: false },
    official_domain: { label: "Domaine officiel reconnu", description: "L'adresse e-mail utilise un domaine officiel", isCorrect: false }
  };
  
  // États pour les cas d'études concrets récents
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(0);
  
  // Collection de cas concrets récents
  const caseStudies = [
    {
      id: 1,
      title: "Cas réel : Ransomware Colonial Pipeline (2021)",
      company: "Colonial Pipeline (opérateur d'oléoducs aux États-Unis)",
      impact: "Arrêt complet du plus grand réseau d'oléoducs américain pendant 6 jours",
      date: "Mai 2021",
      cause: "Compte VPN compromis sans authentification multifacteur (MFA)",
      details: "Les attaquants du groupe DarkSide ont accédé au réseau via un compte VPN inactif mais toujours valide, qui ne nécessitait qu'un simple mot de passe. Ils ont déployé un ransomware qui a paralysé les systèmes informatiques et forcé l'arrêt préventif de l'ensemble du réseau d'oléoducs, perturbant l'approvisionnement en carburant sur toute la côte Est des États-Unis.",
      data: "Systèmes de facturation et de surveillance compromis, forçant l'arrêt des opérations physiques par précaution",
      consequences: [
        "Paiement d'une rançon de 4,4 millions de dollars en Bitcoin (dont 2,3 millions récupérés par le FBI)",
        "Pénurie de carburant dans plusieurs États américains",
        "Augmentation des prix du carburant de 8,6% en moyenne",
        "Déclaration d'état d'urgence par le gouvernement américain",
        "Nouvelles réglementations fédérales sur la cybersécurité des infrastructures critiques"
      ],
      lessons: [
        "Nécessité d'implémenter l'authentification multifacteur (MFA) sur tous les accès sensibles",
        "Importance de la séparation entre les réseaux IT et OT (technologies opérationnelles)",
        "Audits réguliers des comptes d'accès, même inactifs",
        "Préparation d'un plan de continuité d'activité face aux cyberattaques",
        "Impact potentiel des cyberattaques sur les infrastructures physiques critiques"
      ],
      // Information supplémentaire pour le détail des ransomwares
      ransomware: {
        name: "DarkSide Ransomware",
        origin: "Russie (groupe cybercriminel DarkSide)",
        tactics: "Double extorsion (chiffrement + vol de données)",
        encryption: "AES-256 et RSA-4096 pour les fichiers et systèmes Windows",
        payment: "Bitcoin uniquement, portail de paiement sur le darknet",
        timeline: [
          "5 mai 2021: Infection initiale via VPN compromis",
          "7 mai 2021: Annonce publique par Colonial Pipeline de l'attaque",
          "8 mai 2021: Arrêt préventif de tous les oléoducs",
          "10 mai 2021: Engagement du FBI et publication d'une alerte par la CISA",
          "13 mai 2021: Reprise partielle des opérations"
        ],
        technical_details: "Le ransomware utilisait une combinaison d'exploitation de réseaux VPN mal sécurisés, des tactiques d'élévation de privilèges et de mouvement latéral, avec une propagation semi-automatisée à travers les systèmes Windows."
      }
    },
    {
      id: 2,
      title: "Cas réel : Cyberattaque SolarWinds (2020-2021)",
      company: "SolarWinds et plus de 18,000 clients, dont des agences gouvernementales américaines",
      impact: "Une des plus grandes attaques de la chaîne d'approvisionnement de l'histoire",
      date: "Décembre 2020 - Janvier 2021",
      cause: "Attaque sophistiquée de la chaîne d'approvisionnement par un acteur étatique (APT29/Cozy Bear)",
      details: "Les attaquants ont compromis l'infrastructure de développement de SolarWinds pour insérer une porte dérobée (SUNBURST) dans les mises à jour légitimes du logiciel Orion. Cette backdoor a été distribuée à environ 18,000 clients via le mécanisme officiel de mise à jour. Une fois activée, elle permettait aux attaquants d'accéder aux réseaux des victimes.",
      data: "Données sensibles de nombreuses organisations gouvernementales et entreprises du Fortune 500",
      consequences: [
        "Compromission de plusieurs départements fédéraux américains (Trésor, Commerce, Énergie, etc.)",
        "Accès non autorisé aux emails de responsables gouvernementaux de haut niveau",
        "Coûts de remédiation estimés à plus de 100 milliards de dollars",
        "Refonte complète des infrastructures informatiques des organisations touchées",
        "Tensions diplomatiques accrues entre les États-Unis et la Russie"
      ],
      lessons: [
        "Importance critique de la sécurité de la chaîne d'approvisionnement logicielle",
        "Nécessité de vérifier l'intégrité des mises à jour logicielles",
        "Principe de défense en profondeur et de moindre privilège",
        "Détection des comportements anormaux sur le réseau",
        "Importance de la coopération public-privé dans la réponse aux incidents majeurs"
      ],
      // Information supplémentaire pour le détail de l'attaque
      malware: {
        name: "SUNBURST (Solorigate)",
        origin: "APT29 / Cozy Bear (acteur étatique russe)",
        tactics: "Attaque avancée de la chaîne d'approvisionnement",
        stealth: "Période de dormance de 14 jours avant activation, communication mimant le protocole Orion Improvement",
        timeline: [
          "Mars 2020: Compromission initiale de l'environnement de développement SolarWinds",
          "Juin-Juillet 2020: Insertion du code malveillant dans les builds d'Orion",
          "Décembre 2020: Découverte par FireEye suite à leur propre compromission",
          "13 décembre 2020: Publication des premières alertes de sécurité",
          "Janvier-Mars 2021: Découverte de plusieurs autres vecteurs d'attaque liés"
        ],
        technical_details: "Le malware utilisait un système de communication sophistiqué avec des serveurs C2 via des sous-domaines légitimes, avec chiffrement et obfuscation du trafic pour éviter la détection. Une fois activé, il permettait l'exécution de code arbitraire et le déploiement de charges utiles secondaires."
      }
    },
    {
      id: 3,
      title: "Cas réel : Attaque de Log4Shell (2021-2022)",
      company: "Des millions d'organisations utilisant Log4j (bibliothèque Java omniprésente)",
      impact: "Vulnérabilité critique exploitée mondialement dans des centaines de milliers de systèmes",
      date: "Décembre 2021 - 2022",
      cause: "Faille de sécurité critique (CVE-2021-44228) dans la bibliothèque Log4j",
      details: "Log4j, une bibliothèque de journalisation Java utilisée dans d'innombrables applications, contenait une vulnérabilité d'exécution de code à distance (RCE) qui permettait à un attaquant d'exécuter du code arbitraire simplement en envoyant une chaîne de caractères spécialement formatée. La facilité d'exploitation et l'omniprésence de Log4j ont créé une tempête parfaite pour les cybercriminels.",
      data: "Accès complet aux systèmes vulnérables, permettant vol de données, installation de malwares, ou prise de contrôle totale",
      consequences: [
        "Exploitation massive par de nombreux groupes de menaces, dont des acteurs étatiques",
        "Mobilisation internationale des équipes de sécurité pour des correctifs d'urgence",
        "Millions d'heures de travail consacrées à l'identification et au correctif des systèmes",
        "Installation de cryptomineurs, ransomwares et autres malwares sur les systèmes non corrigés",
        "Renforcement des exigences de sécurité pour les composants open-source"
      ],
      lessons: [
        "Importance de l'inventaire logiciel et de la visibilité sur les dépendances",
        "Nécessité de procédures de réponse rapide aux vulnérabilités critiques",
        "Analyse des risques liés aux composants tiers et open-source",
        "Mise en place de mécanismes de défense en profondeur",
        "Importance de la surveillance proactive des systèmes"
      ],
      // Information supplémentaire pour le détail de la vulnérabilité
      vulnerability: {
        name: "Log4Shell (CVE-2021-44228)",
        severity: "10.0/10.0 (Critique) - CVSS v3",
        type: "Remote Code Execution (RCE)",
        affected: "Log4j versions 2.0 à 2.14.1",
        exploitation: "Facile (requiert seulement l'envoi d'une chaîne formatée spécifique)",
        timeline: [
          "24 novembre 2021: Découverte par Chen Zhaojun d'Alibaba Cloud Security Team",
          "9 décembre 2021: Publication du CVE et du correctif (Log4j 2.15.0)",
          "10-11 décembre 2021: Exploitation massive observée dans le monde entier",
          "13 décembre 2021: Publication d'un correctif supplémentaire (2.16.0) suite à un contournement",
          "18 décembre 2021: Troisième correctif (2.17.0) pour une vulnérabilité supplémentaire"
        ],
        impact_scale: "Des millions de systèmes dans le monde, y compris des services cloud, applications d'entreprise, systèmes embarqués, etc.",
        technical_details: "La vulnérabilité permettait l'exécution de code via la fonctionnalité JNDI (Java Naming and Directory Interface) de Log4j lorsque certains motifs étaient journalisés. L'attaquant pouvait forcer la bibliothèque à charger une classe Java malveillante depuis un serveur contrôlé par l'attaquant."
      }
    }
  ];
  
  // Référence au cas d'étude sélectionné
  const caseStudy = caseStudies[selectedCaseStudy];
  
  // Réponses correctes au quiz
  const correctAnswers = {
    q1: "b",
    q2: "c",
    q3: "a",
    q4: "b",
    q5: "c"
  };
  
  // Fonction pour calculer le score du quiz
  const calculateQuizScore = () => {
    let score = 0;
    if (quizAnswers.q1 === correctAnswers.q1) score++;
    if (quizAnswers.q2 === correctAnswers.q2) score++;
    if (quizAnswers.q3 === correctAnswers.q3) score++;
    if (quizAnswers.q4 === correctAnswers.q4) score++;
    if (quizAnswers.q5 === correctAnswers.q5) score++;
    return score;
  };
  
  // Fonction pour évaluer la force d'un mot de passe
  const evaluatePasswordStrength = (password: string) => {
    if (!password) return { strength: "", feedback: "" };
    
    let strength = "";
    let feedback = "";
    
    // Vérifier les critères de sécurité
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 12;
    
    // Déterminer la force
    if (isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
      strength = "fort";
      feedback = "Excellent ! Ce mot de passe est difficile à deviner et à cracker.";
      
      // Ajouter des points si c'est la première fois
      if (!completedInteractions.includes('password-exercise')) {
        setUserPoints(prev => prev + 15);
        setCompletedInteractions(prev => [...prev, 'password-exercise']);
      }
    } else if (password.length >= 8 && 
              ((hasUpperCase && hasLowerCase && hasNumbers) || 
               (hasLowerCase && hasNumbers && hasSpecialChars) || 
               (hasUpperCase && hasLowerCase && hasSpecialChars))) {
      strength = "moyen";
      feedback = "Pas mal, mais pourrait être amélioré. Essayez d'ajouter plus de caractères et de la complexité.";
    } else {
      strength = "faible";
      feedback = "Ce mot de passe est trop faible. Utilisez au moins 12 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.";
    }
    
    return { strength, feedback };
  };
  
  // Fonction pour générer une réponse IA via Azure OpenAI
  const generateAIResponse = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAI(true);
    
    try {
      // Vérifier si la question concerne la cybersécurité
      const cybersecurityKeywords = ["sécurité", "cyber", "hacker", "pirate", "attaque", "malware", "virus", 
        "ransomware", "phishing", "ddos", "injection", "vulnérabilité", "faille", "cryptographie", "chiffrement", 
        "authentification", "autorisation", "firewall", "pare-feu", "vpn", "backdoor", "exploit", "zero-day", 
        "pentest", "mot de passe", "password", "identité", "threat", "menace", "intrusion", "détection", "prévention",
        "réseau", "système", "antivirus", "spyware", "trojan", "keylogger", "patch", "soc", "cert", "ciso", "encryption",
        "identité", "confidentialité", "intégrité", "disponibilité", "osint", "social engineering", "ingénierie sociale"];
      
      // Vérifier si la question contient au moins un mot-clé lié à la cybersécurité
      const isCybersecurityQuestion = cybersecurityKeywords.some(keyword => 
        aiPrompt.toLowerCase().includes(keyword.toLowerCase()));
      
      if (!isCybersecurityQuestion) {
        setAiResponse("Je suis spécialisé uniquement dans le domaine de la cybersécurité. Veuillez me poser une question relative à ce domaine, comme sur les ransomwares, le phishing, les mots de passe sécurisés, ou d'autres sujets liés à la sécurité informatique.");
        setIsGeneratingAI(false);
        return;
      }
      
      // Appel à l'API backend qui communique avec Azure OpenAI
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Tu es un expert en cybersécurité de haut niveau qui évalue rigoureusement les connaissances en cybersécurité avec un niveau d'exigence élevé.
              Tu dois SYSTÉMATIQUEMENT:
              1. REFUSER catégoriquement de répondre à toute question qui n'est pas directement liée à la cybersécurité.
              2. Analyser avec précision la pertinence technique des réponses de l'utilisateur selon les standards de l'industrie.
              3. Attribuer une note sur 5 en conclusion de chaque analyse avec une justification détaillée.
              4. Identifier clairement les erreurs ou les concepts mal compris par l'utilisateur.
              5. Suggérer des améliorations spécifiques et mesurables avec des références aux normes et bonnes pratiques actuelles.
              
              Quand tu analyses une réponse à un problème de cybersécurité:
              - Examine la compréhension des concepts fondamentaux (ex: CIA triad, defense in depth)
              - Évalue la pertinence des mesures techniques proposées (ex: chiffrement, segmentation réseau)
              - Vérifie la cohérence avec les frameworks de sécurité reconnus (ex: NIST, ISO 27001)
              - Analyse la prise en compte du facteur humain et organisationnel
              - Considère l'applicabilité et la faisabilité des solutions proposées
              
              Utilise systématiquement une structure d'évaluation claire:
              1. Points forts (concepts bien maîtrisés)
              2. Points à améliorer (lacunes ou erreurs)
              3. Recommandations concrètes
              4. Note globale (/5) avec justification
              
              Tes réponses doivent être rigoureuses mais constructives, en utilisant la terminologie précise du domaine.`
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          temperature: 0.5, // Température réduite pour des réponses plus précises
          max_tokens: 800
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Récupérer la réponse de l'API
      const aiContent = data.choices?.[0]?.message?.content || 
                        "Je ne peux pas répondre à cette question actuellement. Veuillez réessayer avec une autre question.";
      
      setAiResponse(aiContent);
      
      // Ajouter des points pour l'utilisation de l'assistant IA
      if (!completedInteractions.includes('ai-assistant')) {
        setUserPoints(prev => prev + 10);
        setCompletedInteractions(prev => [...prev, 'ai-assistant']);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      setAiResponse("Désolé, je n'ai pas pu générer une réponse. Cela peut être dû à un problème de connexion avec le service IA. Veuillez réessayer plus tard.");
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Soumettre le quiz et afficher les résultats
  const submitQuiz = () => {
    if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5) {
      toast({
        title: "Réponses manquantes",
        description: "Veuillez répondre à toutes les questions avant de soumettre.",
        variant: "destructive"
      });
      return;
    }
    
    const score = calculateQuizScore();
    setQuizScore(score);
    setQuizScored(true);
    setShowQuizResult(true);
    
    // Mettre à jour la progression
    setProgress(90 + (score * 2)); // 90% + 2% par bonne réponse
    
    // Accorder le badge seulement si score >= 4/5 (80% ou plus)
    if (score >= 4 && !badgeEarned) {
      setBadgeEarned(true);
      setProgress(100);
      
      // Ajouter des points pour la réussite du quiz
      if (!completedInteractions.includes('quiz-completed')) {
        setUserPoints(prev => prev + 25);
        setCompletedInteractions(prev => [...prev, 'quiz-completed']);
      }
      
      toast({
        title: "Badge obtenu !",
        description: "Félicitations ! Vous avez obtenu le badge 'Fondamentaux de la Cybersécurité'.",
      });
    } else if (!completedInteractions.includes('quiz-completed')) {
      // Ajouter quelques points même si le score n'est pas parfait
      setUserPoints(prev => prev + (score * 3));
      setCompletedInteractions(prev => [...prev, 'quiz-completed']);
      
      if (score < 3) {
        toast({
          title: "Quiz terminé",
          description: `Vous avez obtenu ${score}/5. Révisez le contenu et retentez votre chance !`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Quiz terminé",
          description: `Vous avez obtenu ${score}/5. Une bonne base, continuez à vous améliorer !`,
        });
      }
    }
  };
  
  // Réinitialiser le quiz
  const resetQuiz = () => {
    setQuizAnswers({
      q1: "",
      q2: "",
      q3: "",
      q4: "",
      q5: ""
    });
    setQuizScored(false);
    setShowQuizResult(false);
  };
  
  // Mettre à jour les réponses du quiz
  const updateQuizAnswer = (question: string, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };
  
  // Formater la classe de la réponse du quiz
  const getAnswerClass = (question: string, option: string) => {
    if (!showQuizResult) return "";
    
    const isSelected = quizAnswers[question as keyof typeof quizAnswers] === option;
    const isCorrect = correctAnswers[question as keyof typeof correctAnswers] === option;
    
    if (isSelected && isCorrect) return "bg-green-100 border-green-500 dark:bg-green-900/30";
    if (isSelected && !isCorrect) return "bg-red-100 border-red-500 dark:bg-red-900/30";
    if (!isSelected && isCorrect) return "bg-green-100 border-green-500 dark:bg-green-900/30";
    
    return "";
  };
  
  // Fonctions pour adapter le contenu selon le niveau
  const getContentByLevel = (content: {
    debutant: string | React.ReactNode;
    intermediaire: string | React.ReactNode;
    avance: string | React.ReactNode;
  }) => {
    return content[currentLevel];
  };

  const getLevelSpecificExamples = () => {
    switch (currentLevel) {
      case 'debutant':
        return {
          title: "Exemple simple",
          description: "Concepts de base avec explications détaillées",
          complexity: "Facile à comprendre"
        };
      case 'intermediaire':
        return {
          title: "Cas pratique",
          description: "Scénarios réalistes avec analyse technique",
          complexity: "Niveau entreprise"
        };
      case 'avance':
        return {
          title: "Défi expert",
          description: "Analyses complexes et recherche de pointe",
          complexity: "Expertise technique"
        };
    }
  };

  // Effet pour fermer le sélecteur de niveau si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLevelSelector) {
        setShowLevelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLevelSelector]);

  // Mise à jour automatique de la progression en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "principes") setProgress(20);
    if (activeTab === "menaces") setProgress(35);
    if (activeTab === "casreel") setProgress(50);
    if (activeTab === "glossaire") setProgress(65);
    if (activeTab === "best-practices") setProgress(80);
    if (activeTab === "quiz") setProgress(quizScored ? 100 : 95);
  }, [activeTab, quizScored]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      {/* En-tête du module */}
      <div className="bg-blue-900/50 shadow-md border-b border-blue-800/50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/cyber/learning-center")}
              className="rounded-full bg-blue-800/30 hover:bg-blue-800/50 text-blue-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-xl font-bold">Introduction à la Cybersécurité</h1>
              <p className="text-blue-200 text-sm">Module fondamental - Durée estimée : 30 minutes</p>
            </div>
            
            <div className="ml-auto flex items-center gap-4">
              {/* Sélecteur de niveau */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLevelSelector(!showLevelSelector)}
                  className="border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50 hover:text-white relative"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Niveau: {currentLevel === 'debutant' ? 'Débutant' : currentLevel === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                </Button>
                
                {/* Bouton d'actualisation */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsRefreshing(true);
                    // Simuler l'actualisation
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setIsRefreshing(false);
                    toast({
                      title: "Formation actualisée !",
                      description: `Contenu adapté au niveau ${currentLevel}`,
                    });
                  }}
                  disabled={isRefreshing}
                  className="border-blue-700/50 bg-blue-900/30 text-blue-200 hover:bg-blue-800/50 hover:text-white"
                >
                  <Sparkles className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
              
              {/* Progression */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-200">{progress}% complété</span>
                <Progress value={progress} className="w-24 bg-blue-950" />
              </div>
            </div>
            
            {/* Menu déroulant de sélection de niveau */}
            {showLevelSelector && (
              <div className="absolute right-4 top-16 bg-blue-900/95 border border-blue-700/50 rounded-lg shadow-xl z-50 p-4 min-w-[280px]">
                <h3 className="text-white font-medium mb-3">Choisir votre niveau</h3>
                <div className="space-y-3">
                  <div 
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      currentLevel === 'debutant' 
                        ? 'bg-blue-800/50 border-blue-600' 
                        : 'bg-blue-950/50 border-blue-800/30 hover:bg-blue-800/30'
                    }`}
                    onClick={() => {
                      setCurrentLevel('debutant');
                      setContentKey(prev => prev + 1);
                      setShowLevelSelector(false);
                      toast({
                        title: "Niveau débutant sélectionné",
                        description: "Contenu adapté aux concepts de base",
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-white font-medium">Débutant</span>
                    </div>
                    <p className="text-blue-200 text-xs">Concepts de base, terminologie essentielle, exemples simples</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      currentLevel === 'intermediaire' 
                        ? 'bg-blue-800/50 border-blue-600' 
                        : 'bg-blue-950/50 border-blue-800/30 hover:bg-blue-800/30'
                    }`}
                    onClick={() => {
                      setCurrentLevel('intermediaire');
                      setContentKey(prev => prev + 1);
                      setShowLevelSelector(false);
                      toast({
                        title: "Niveau intermédiaire sélectionné",
                        description: "Contenu avec concepts approfondis",
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-white font-medium">Intermédiaire</span>
                    </div>
                    <p className="text-blue-200 text-xs">Techniques avancées, cas pratiques, analyses détaillées</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      currentLevel === 'avance' 
                        ? 'bg-blue-800/50 border-blue-600' 
                        : 'bg-blue-950/50 border-blue-800/30 hover:bg-blue-800/30'
                    }`}
                    onClick={() => {
                      setCurrentLevel('avance');
                      setContentKey(prev => prev + 1);
                      setShowLevelSelector(false);
                      toast({
                        title: "Niveau avancé sélectionné",
                        description: "Contenu expert avec défis complexes",
                      });
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-white font-medium">Avancé</span>
                    </div>
                    <p className="text-blue-200 text-xs">Expertise technique, défis complexes, recherche de pointe</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Navigation entre les différentes parties du module */}
      <div className="bg-blue-900/20 border-b border-blue-800/40">
        <div className="container mx-auto px-4">
          <div className="w-full">
            <div className="bg-transparent h-14 justify-start border-b border-blue-800/40 flex">
              <button 
                onClick={() => setActiveTab("principes")}
                className={`px-4 h-14 ${activeTab === "principes" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Principes Fondamentaux
              </button>
              <button 
                onClick={() => setActiveTab("menaces")}
                className={`px-4 h-14 ${activeTab === "menaces" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Menaces Actuelles
              </button>
              <button 
                onClick={() => setActiveTab("casreel")}
                className={`px-4 h-14 ${activeTab === "casreel" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Cas Concret
              </button>
              <button 
                onClick={() => setActiveTab("glossaire")}
                className={`px-4 h-14 ${activeTab === "glossaire" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Glossaire Cyber
              </button>
              <button 
                onClick={() => setActiveTab("best-practices")}
                className={`px-4 h-14 ${activeTab === "best-practices" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Bonnes Pratiques
              </button>
              <button 
                onClick={() => setActiveTab("quiz")}
                className={`px-4 h-14 ${activeTab === "quiz" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Quiz & Évaluation
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          key={contentKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Section principale de contenu */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === "principes" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Shield className="mr-3 h-6 w-6 text-blue-400" />
                    Principes fondamentaux de la cybersécurité
                  </h2>
                  
                  {/* Badge de niveau actuel */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`${
                      currentLevel === 'debutant' ? 'bg-green-600/70' :
                      currentLevel === 'intermediaire' ? 'bg-amber-600/70' : 'bg-red-600/70'
                    }`}>
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Niveau {currentLevel === 'debutant' ? 'Débutant' : currentLevel === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                    </Badge>
                    <span className="text-xs text-blue-300">
                      {getLevelSpecificExamples().complexity}
                    </span>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200">
                      {getContentByLevel({
                        debutant: "La cybersécurité, c'est comme protéger votre maison : vous verrouillez les portes, installez des alarmes et vérifiez qui entre. Dans le monde numérique, c'est pareil ! Nous protégeons nos ordinateurs, nos données et nos réseaux contre les personnes malveillantes qui veulent les voler ou les endommager.",
                        intermediaire: "La cybersécurité est un domaine multidisciplinaire qui combine technologies, processus et politiques pour protéger les systèmes d'information. Elle englobe la protection des infrastructures critiques, la gestion des risques et la résilience organisationnelle face aux cybermenaces en constante évolution.",
                        avance: "La cybersécurité moderne s'articule autour de paradigmes tels que Zero Trust, la threat intelligence, et l'adaptive security. Elle intègre l'IA/ML pour la détection comportementale, la forensic numérique avancée, et la cyber-résilience dans des architectures cloud-native et edge computing."
                      })}
                    </p>
                    
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">Les trois piliers de la cybersécurité</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Lock className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Confidentialité</h4>
                        </div>
                        <p className="text-sm text-blue-200">
                          {getContentByLevel({
                            debutant: "S'assurer que vos informations privées restent privées, comme garder un secret.",
                            intermediaire: "Garantir que les informations ne sont accessibles qu'aux personnes autorisées selon les politiques d'accès.",
                            avance: "Mise en œuvre de contrôles d'accès granulaires, chiffrement end-to-end et classification des données selon leur sensibilité."
                          })}
                        </p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300">
                            <strong>Exemple {currentLevel} :</strong> {getContentByLevel({
                              debutant: "Utiliser un mot de passe pour protéger votre téléphone.",
                              intermediaire: "Le chiffrement HTTPS quand vous vous connectez à votre banque en ligne.",
                              avance: "Implémentation de HSM (Hardware Security Modules) pour la gestion des clés cryptographiques dans un environnement multi-cloud."
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Intégrité</h4>
                        </div>
                        <p className="text-sm text-blue-200">
                          {getContentByLevel({
                            debutant: "S'assurer que vos données n'ont pas été modifiées par quelqu'un d'autre.",
                            intermediaire: "Assurer que les données restent exactes et complètes, sans modification non autorisée.",
                            avance: "Garantir la non-répudiation et la traçabilité des modifications via des mécanismes cryptographiques et de logging avancés."
                          })}
                        </p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300">
                            <strong>Exemple {currentLevel} :</strong> {getContentByLevel({
                              debutant: "Vérifier qu'un fichier téléchargé n'a pas été corrompu.",
                              intermediaire: "Les signatures numériques qui prouvent qu'un document n'a pas été modifié.",
                              avance: "Blockchain et Merkle trees pour l'immutabilité des logs d'audit dans des systèmes distribués."
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Disponibilité</h4>
                        </div>
                        <p className="text-sm text-blue-200">
                          {getContentByLevel({
                            debutant: "S'assurer que vos systèmes fonctionnent quand vous en avez besoin.",
                            intermediaire: "Garantir l'accès aux informations et ressources pour les utilisateurs autorisés quand ils en ont besoin.",
                            avance: "Architectures résilientes avec redondance géographique, auto-healing et objectifs RTO/RPO stricts."
                          })}
                        </p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300">
                            <strong>Exemple {currentLevel} :</strong> {getContentByLevel({
                              debutant: "Avoir une sauvegarde de vos photos importantes sur un autre appareil.",
                              intermediaire: "Les serveurs de secours qui prennent le relais en cas de panne du serveur principal.",
                              avance: "Architecture microservices avec circuit breakers, chaos engineering et déploiements blue-green pour la continuité de service."
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">Les principes fondamentaux de défense</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Users className="h-5 w-5 text-blue-300 mr-2" />
                          Défense en profondeur
                        </h4>
                        <p className="text-sm text-blue-200">
                          Consiste à mettre en place plusieurs couches de sécurité complémentaires, pour que si l'une est compromise, 
                          les autres continuent à protéger le système. C'est l'équivalent numérique d'un château avec douves, murailles, 
                          et gardes - chaque élément ajoute une couche de protection.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Server className="h-5 w-5 text-blue-300 mr-2" />
                          Moindre privilège
                        </h4>
                        <p className="text-sm text-blue-200">
                          Principe selon lequel un utilisateur, un système ou une application ne doit disposer que des droits minimaux 
                          nécessaires pour accomplir ses tâches. Cela limite la surface d'attaque et réduit l'impact potentiel en cas de compromission.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Cpu className="h-5 w-5 text-blue-300 mr-2" />
                          Sécurité par conception
                        </h4>
                        <p className="text-sm text-blue-200">
                          Approche qui intègre la sécurité dès la conception des systèmes et tout au long de leur cycle de vie, 
                          plutôt que de l'ajouter comme une couche supplémentaire après coup. Elle permet d'anticiper les menaces 
                          et de construire des systèmes intrinsèquement plus robustes.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Share2 className="h-5 w-5 text-blue-300 mr-2" />
                          Séparation des privilèges
                        </h4>
                        <p className="text-sm text-blue-200">
                          Principe qui divise les opérations critiques en plusieurs parties, nécessitant l'intervention de 
                          différentes personnes ou systèmes pour être complétées. Cela réduit les risques d'abus de pouvoir 
                          et complique la tâche des attaquants.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "menaces" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <AlertTriangle className="mr-3 h-6 w-6 text-amber-400" />
                    Panorama des menaces actuelles
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200">
                      Le paysage des menaces cybernétiques évolue constamment, avec des acteurs malveillants développant de nouvelles 
                      techniques d'attaque. Comprendre ces menaces est essentiel pour mettre en place des défenses efficaces.
                    </p>
                    
                    <div className="mt-6 mb-4">
                      <div className="flex justify-between space-x-2 border-b border-blue-800/40">
                        <button 
                          onClick={() => setActiveSubTab("malware")} 
                          className={`py-2 px-4 ${activeSubTab === "malware" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Malwares
                        </button>
                        <button 
                          onClick={() => setActiveSubTab("socialeng")} 
                          className={`py-2 px-4 ${activeSubTab === "socialeng" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Ingénierie sociale
                        </button>
                        <button 
                          onClick={() => setActiveSubTab("advanced")} 
                          className={`py-2 px-4 ${activeSubTab === "advanced" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Menaces avancées
                        </button>
                      </div>
                    </div>
                    
                    {activeSubTab === "malware" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Ransomware</h4>
                          <p className="text-sm text-blue-200">
                            Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour les déchiffrer. 
                            Les ransomwares modernes pratiquent souvent la double extorsion : vol des données avant chiffrement, 
                            avec menace de publication si la rançon n'est pas payée.
                          </p>
                          <p className="text-xs text-amber-200 mt-2">
                            <strong>Exemples récents :</strong> REvil, DarkSide, Conti, LockBit
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Malware as a Service (MaaS)</h4>
                          <p className="text-sm text-blue-200">
                            Modèle commercial où des développeurs de logiciels malveillants proposent leurs outils 
                            en location à d'autres criminels. Cela a démocratisé les cyberattaques en permettant à des 
                            acteurs peu techniques de lancer des attaques sophistiquées.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Logiciels espions (Spyware)</h4>
                          <p className="text-sm text-blue-200">
                            Programmes conçus pour collecter des informations sur un utilisateur sans son consentement. 
                            Ils peuvent enregistrer les frappes au clavier, capturer des captures d'écran, et voler des 
                            informations sensibles comme les identifiants bancaires.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Chevaux de Troie bancaires</h4>
                          <p className="text-sm text-blue-200">
                            Malwares spécifiquement conçus pour voler des informations bancaires et financières. 
                            Ils peuvent modifier l'affichage des sites web bancaires légitimes pour intercepter 
                            les identifiants ou rediriger des transactions.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {activeSubTab === "socialeng" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Phishing sophistiqué</h4>
                          <p className="text-sm text-blue-200">
                            Les attaques de phishing sont devenues beaucoup plus ciblées et convaincantes. Le spear phishing 
                            cible des individus spécifiques avec des messages personnalisés, tandis que le whaling vise les 
                            cadres supérieurs et les PDG.
                          </p>
                          <p className="text-xs text-amber-200 mt-2">
                            <strong>Tendance actuelle :</strong> Utilisation de l'IA pour créer des messages plus convaincants et personnalisés
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Compromission des emails professionnels (BEC)</h4>
                          <p className="text-sm text-blue-200">
                            Attaques où les criminels se font passer pour des cadres ou des partenaires commerciaux 
                            pour demander des transferts d'argent ou des informations sensibles. Ces attaques exploitent 
                            la confiance et les processus d'entreprise plutôt que des vulnérabilités techniques.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Deepfakes et manipulation médiatique</h4>
                          <p className="text-sm text-blue-200">
                            L'intelligence artificielle permet désormais de créer des vidéos et des enregistrements audio 
                            falsifiés très convaincants. Ces technologies sont de plus en plus utilisées dans des attaques 
                            d'ingénierie sociale, comme simuler des appels de dirigeants pour autoriser des transactions.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques via les réseaux sociaux</h4>
                          <p className="text-sm text-blue-200">
                            Les attaquants exploitent les informations partagées sur les réseaux sociaux pour mener des 
                            attaques personnalisées. Ils peuvent également créer de faux profils pour établir des relations 
                            avec des employés ciblés et les manipuler.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {activeSubTab === "advanced" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques sur la chaîne d'approvisionnement</h4>
                          <p className="text-sm text-blue-200">
                            Les attaquants compromettent des fournisseurs ou des produits logiciels de confiance pour 
                            atteindre leurs cibles finales. L'attaque SolarWinds de 2020 est un exemple emblématique, 
                            où des acteurs malveillants ont inséré du code malveillant dans les mises à jour d'un logiciel 
                            utilisé par des milliers d'organisations.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Menaces persistantes avancées (APT)</h4>
                          <p className="text-sm text-blue-200">
                            Campagnes d'attaques sur le long terme, généralement menées par des groupes soutenus par des États. 
                            Ces attaques sont caractérisées par leur sophistication technique, leur discrétion et leur persistance. 
                            Elles visent généralement l'espionnage, le vol de propriété intellectuelle ou le sabotage.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques contre les infrastructures critiques</h4>
                          <p className="text-sm text-blue-200">
                            Ciblage des systèmes industriels et des infrastructures essentielles comme l'énergie, l'eau, 
                            les transports ou la santé. Ces attaques peuvent avoir des conséquences graves dans le monde réel, 
                            comme l'a montré l'attaque contre Colonial Pipeline en 2021, qui a perturbé l'approvisionnement 
                            en carburant aux États-Unis.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques par l'IA et automatisées</h4>
                          <p className="text-sm text-blue-200">
                            L'intelligence artificielle et l'automatisation sont de plus en plus utilisées pour identifier 
                            les vulnérabilités, personnaliser les attaques et contourner les défenses. Ces technologies 
                            permettent des attaques plus rapides, plus précises et à plus grande échelle.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "menaces" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Monitor className="h-5 w-5 mr-2 text-green-400" />
                      Exercice Pratique: Détection de Phishing
                    </h3>
                    
                    <Badge className="bg-green-600/70">
                      <Target className="h-3 w-3 mr-1" />
                      SIMULATION
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-blue-300">
                      Apprenez à identifier les e-mails de phishing. Analysez l'exemple ci-dessous et identifiez les indices suspects.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const prev = currentPhishingExample > 0 ? currentPhishingExample - 1 : phishingExamples.length - 1;
                          setCurrentPhishingExample(prev);
                          setExerciseData({...exerciseData, phishingChecks: [], phishingFeedback: ""});
                        }}
                        className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      >
                        ←
                      </Button>
                      <span className="text-xs text-blue-300">
                        {currentPhishingExample + 1}/{phishingExamples.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const next = currentPhishingExample < phishingExamples.length - 1 ? currentPhishingExample + 1 : 0;
                          setCurrentPhishingExample(next);
                          setExerciseData({...exerciseData, phishingChecks: [], phishingFeedback: ""});
                        }}
                        className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      >
                        →
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">
                      {phishingExamples[currentPhishingExample].title}
                    </h4>
                  </div>
                  
                  <div className="p-4 bg-white text-gray-800 rounded-md mb-4 border border-blue-700/50">
                    <div className="border-b border-gray-200 pb-2 mb-2">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-sm">De: {phishingExamples[currentPhishingExample].sender}</div>
                          <div className="text-sm">À: {phishingExamples[currentPhishingExample].recipient}</div>
                        </div>
                        <div className="text-xs text-gray-500">10:42 AM</div>
                      </div>
                      <div className="font-bold text-sm mt-1">Objet: {phishingExamples[currentPhishingExample].subject}</div>
                    </div>
                    
                    <div className="text-sm space-y-2 whitespace-pre-line">
                      {phishingExamples[currentPhishingExample].body}
                    </div>
                  </div>
                  
                  <p className="text-sm text-blue-300 mb-3">
                    Identifiez les indices de phishing dans cet e-mail :
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    {/* Générer dynamiquement les options pour l'exemple actuel */}
                    {(() => {
                      const currentExample = phishingExamples[currentPhishingExample];
                      // Mélanger les indices corrects et incorrects pour cet exemple
                      const allOptions = [
                        ...currentExample.correctFlags.map(flag => ({ flag, ...phishingFlags[flag as PhishingFlagKey] })),
                        ...currentExample.wrongFlags.map(flag => ({ flag, ...phishingFlags[flag as PhishingFlagKey] }))
                      ];
                      
                      return allOptions.map((option, index) => (
                        <div key={`${currentPhishingExample}-${option.flag}`} className="flex items-start space-x-2">
                          <Checkbox 
                            id={`phishing-${option.flag}`}
                            checked={exerciseData.phishingChecks?.includes(option.flag) || false}
                            onCheckedChange={(checked) => {
                              const current = exerciseData.phishingChecks || [];
                              const updated = checked 
                                ? [...current, option.flag] 
                                : current.filter(item => item !== option.flag);
                              
                              setExerciseData({
                                ...exerciseData,
                                phishingChecks: updated
                              });
                            }} 
                          />
                          <div className="grid gap-1.5">
                            <Label htmlFor={`phishing-${option.flag}`} className="text-sm text-white">
                              {option.label}
                            </Label>
                            <p className="text-xs text-blue-300">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      const checks = exerciseData.phishingChecks || [];
                      const currentExample = phishingExamples[currentPhishingExample];
                      
                      // Calculer le score basé sur les bonnes réponses et les erreurs
                      const correctSelected = currentExample.correctFlags.filter(flag => checks.includes(flag)).length;
                      const wrongSelected = currentExample.wrongFlags.filter(flag => checks.includes(flag)).length;
                      const totalCorrect = currentExample.correctFlags.length;
                      
                      // Score = (bonnes réponses - mauvaises réponses) / total possible * 100
                      const rawScore = Math.max(0, correctSelected - wrongSelected);
                      const maxScore = totalCorrect;
                      const scorePercentage = Math.round((rawScore / maxScore) * 100);
                      
                      let feedback = "";
                      const exerciseKey = `phishing-exercise-${currentPhishingExample}`;
                      
                      if (scorePercentage >= 80 && wrongSelected === 0) {
                        feedback = `Excellent ! Vous avez identifié ${correctSelected}/${totalCorrect} indices corrects sans tomber dans les pièges. Score: ${scorePercentage}%`;
                        
                        // Ajouter des points si première réussite complète pour cet exemple
                        if (!completedInteractions.includes(exerciseKey)) {
                          setUserPoints(prev => prev + 20);
                          setCompletedInteractions(prev => [...prev, exerciseKey]);
                          
                          toast({
                            title: "Exercice de phishing réussi !",
                            description: `+20 points pour l'exemple "${currentExample.title}"`,
                          });
                        }
                      } else if (scorePercentage >= 60) {
                        feedback = `Bon travail ! Vous avez identifié ${correctSelected}/${totalCorrect} indices corrects mais avez sélectionné ${wrongSelected} faux indices. Score: ${scorePercentage}%`;
                        
                        // Ajouter moins de points pour une réussite partielle
                        if (!completedInteractions.includes(exerciseKey)) {
                          setUserPoints(prev => prev + 10);
                          setCompletedInteractions(prev => [...prev, exerciseKey]);
                          
                          toast({
                            title: "Bonne analyse !",
                            description: `+10 points pour l'exemple "${currentExample.title}"`,
                          });
                        }
                      } else {
                        feedback = `Vous avez identifié ${correctSelected}/${totalCorrect} indices corrects et sélectionné ${wrongSelected} faux indices. Score: ${scorePercentage}%. Revoyez les caractéristiques des e-mails de phishing.`;
                        
                        if (wrongSelected > 0) {
                          feedback += ` Attention aux pièges : certaines options peuvent sembler suspectes mais ne s'appliquent pas à cet exemple.`;
                        }
                      }
                      
                      setExerciseData({
                        ...exerciseData,
                        phishingFeedback: feedback
                      });
                    }}
                  >
                    Vérifier mes réponses
                  </Button>
                  
                  {exerciseData.phishingFeedback && (
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-md">
                      <h4 className="text-sm font-medium text-white mb-1">Résultat de l'analyse :</h4>
                      <p className="text-xs text-blue-200">
                        {exerciseData.phishingFeedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {activeTab === "casreel" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <Database className="mr-3 h-6 w-6 text-red-400" />
                      Cas réels récents
                    </h2>
                    
                    <div className="flex gap-2">
                      {caseStudies.map((cs, index) => (
                        <Button 
                          key={cs.id}
                          variant={selectedCaseStudy === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedCaseStudy(index);
                            setCaseStudyExpanded(false);
                            
                            // Ajouter des points pour l'exploration de cas concrets
                            if (!completedInteractions.includes(`case-study-${index}`)) {
                              setUserPoints(prev => prev + 5);
                              setCompletedInteractions(prev => [...prev, `case-study-${index}`]);
                            }
                          }}
                          className={selectedCaseStudy === index 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                          }
                        >
                          Cas {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <motion.div 
                    key={selectedCaseStudy}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="prose prose-invert max-w-none"
                  >
                    <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">{caseStudy.title}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowCaseTechnicalDetails(!showCaseTechnicalDetails);
                            
                            if (!completedInteractions.includes(`technical-details-${selectedCaseStudy}`)) {
                              setUserPoints(prev => prev + 10);
                              setCompletedInteractions(prev => [...prev, `technical-details-${selectedCaseStudy}`]);
                              
                              toast({
                                title: "Détails techniques débloqués !",
                                description: "+10 points pour votre intérêt aux aspects techniques",
                              });
                            }
                          }}
                          className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {showCaseTechnicalDetails ? "Masquer les détails" : "Détails techniques"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Organisation touchée</h4>
                        <p className="text-sm text-blue-200">{caseStudy.company}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Impact global</h4>
                        <p className="text-sm text-blue-200">{caseStudy.impact}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Période de l'incident</h4>
                        <p className="text-sm text-blue-200">{caseStudy.date}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Cause principale</h4>
                        <p className="text-sm text-blue-200">{caseStudy.cause}</p>
                      </div>
                    </div>
                    
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/40 mb-6">
                      <h4 className="font-medium text-white mb-2">Description détaillée</h4>
                      <p className="text-sm text-blue-200">{caseStudy.details}</p>
                      <p className="text-sm mt-2 text-blue-200"><strong>Données/systèmes compromis :</strong> {caseStudy.data}</p>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-500 ${caseStudyExpanded ? "max-h-[1000px]" : "max-h-0"}`}>
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-6">
                        <h4 className="font-medium text-white mb-2">Conséquences</h4>
                        <ul className="text-sm text-blue-200 space-y-1 list-disc pl-5">
                          {caseStudy.consequences.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/40">
                        <h4 className="font-medium text-white mb-2">Leçons à retenir</h4>
                        <ul className="text-sm text-blue-200 space-y-1 list-disc pl-5">
                          {caseStudy.lessons.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Section détails techniques des malwares/attaques */}
                    {showCaseTechnicalDetails && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 mb-6 bg-red-900/10 p-4 rounded-lg border border-red-800/30"
                      >
                        <div className="flex items-center mb-3">
                          <Shield className="h-5 w-5 text-red-400 mr-2" />
                          <h4 className="text-lg font-semibold text-white">Détails techniques de l'attaque</h4>
                        </div>
                        
                        {selectedCaseStudy === 0 && caseStudy.ransomware && (
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Badge className="bg-red-600/70">
                                <Flame className="h-3 w-3 mr-1" />
                                RANSOMWARE
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-white font-medium">Nom du malware:</p>
                                <p className="text-blue-200">{caseStudy.ransomware.name}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Origine:</p>
                                <p className="text-blue-200">{caseStudy.ransomware.origin}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Tactiques:</p>
                                <p className="text-blue-200">{caseStudy.ransomware.tactics}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Cryptographie:</p>
                                <p className="text-blue-200">{caseStudy.ransomware.encryption}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Chronologie de l'attaque:</p>
                              <ul className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200 space-y-1 list-disc pl-5">
                                {caseStudy.ransomware.timeline.map((event, index) => (
                                  <li key={index}>{event}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Spécificités techniques:</p>
                              <p className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200">
                                {caseStudy.ransomware.technical_details}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {selectedCaseStudy === 1 && caseStudy.malware && (
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Badge className="bg-amber-600/70">
                                <Shield className="h-3 w-3 mr-1" />
                                MALWARE APT
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-white font-medium">Nom du malware:</p>
                                <p className="text-blue-200">{caseStudy.malware.name}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Origine:</p>
                                <p className="text-blue-200">{caseStudy.malware.origin}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Tactiques:</p>
                                <p className="text-blue-200">{caseStudy.malware.tactics}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Furtivité:</p>
                                <p className="text-blue-200">{caseStudy.malware.stealth}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Chronologie de l'attaque:</p>
                              <ul className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200 space-y-1 list-disc pl-5">
                                {caseStudy.malware.timeline.map((event, index) => (
                                  <li key={index}>{event}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Spécificités techniques:</p>
                              <p className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200">
                                {caseStudy.malware.technical_details}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {selectedCaseStudy === 2 && caseStudy.vulnerability && (
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <Badge className="bg-purple-600/70">
                                <Code className="h-3 w-3 mr-1" />
                                VULNÉRABILITÉ
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-white font-medium">Nom:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.name}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Sévérité:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.severity}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Type:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.type}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Versions affectées:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.affected}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Difficulté d'exploitation:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.exploitation}</p>
                              </div>
                              <div>
                                <p className="text-white font-medium">Impact:</p>
                                <p className="text-blue-200">{caseStudy.vulnerability.impact_scale}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Chronologie de découverte:</p>
                              <ul className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200 space-y-1 list-disc pl-5">
                                {caseStudy.vulnerability.timeline.map((event, index) => (
                                  <li key={index}>{event}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <p className="text-white font-medium mb-1">Détails techniques:</p>
                              <p className="bg-blue-900/30 p-3 rounded border border-blue-800/40 text-xs text-blue-200">
                                {caseStudy.vulnerability.technical_details}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCaseStudyExpanded(!caseStudyExpanded)}
                        className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      >
                        {caseStudyExpanded ? "Réduire les détails" : "Voir tous les détails"}
                        <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${caseStudyExpanded ? "rotate-90" : ""}`} />
                      </Button>
                    </div>
                  </motion.div>
                  
                  <div className="mt-8 p-5 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Mini-jeux Interactifs</h3>
                      <Badge className="bg-indigo-600/70">
                        <Zap className="h-3 w-3 mr-1" />
                        INTERACTIF
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                      {miniGames.map((game) => (
                        <Button
                          key={game.id}
                          variant={selectedMiniGame === game.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedMiniGame(game.id);
                            if (!completedInteractions.includes(`minigame-select-${game.id}`)) {
                              setUserPoints(prev => prev + 5);
                              setCompletedInteractions(prev => [...prev, `minigame-select-${game.id}`]);
                              
                              toast({
                                title: "Nouveau mini-jeu sélectionné !",
                                description: `+5 points pour explorer "${game.name}"`,
                              });
                            }
                          }}
                          className={selectedMiniGame === game.id 
                            ? "bg-blue-600 hover:bg-blue-700 whitespace-nowrap" 
                            : "text-blue-300 border-blue-800/50 hover:bg-blue-800/30 whitespace-nowrap"
                          }
                        >
                          {game.name}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Mini-jeu 1: Vous êtes le RSSI */}
                    {selectedMiniGame === "rssi" && (
                      <div className="space-y-4">
                        <p className="text-sm text-blue-200 mb-4">
                          Si vous étiez responsable de la sécurité dans cette organisation, quelles mesures préventives auriez-vous mises en place pour éviter cette attaque ? 
                          Réfléchissez aux leçons apprises et aux bonnes pratiques.
                        </p>
                        
                        <div className="p-4 bg-blue-950/70 rounded-lg border border-blue-800/50 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white flex items-center">
                              <BrainCircuit className="h-4 w-4 mr-2 text-purple-400" />
                              Exercice d'analyse de cas
                            </h4>
                            <Badge className="bg-purple-600/70">
                              <FileCheck className="h-3 w-3 mr-1" />
                              INTERACTIF
                            </Badge>
                          </div>
                          
                          {selectedCaseStudy === 0 && (
                            <div className="space-y-3">
                              <p className="text-sm text-blue-200">
                                Analysez le cas Colonial Pipeline et identifiez les mesures de sécurité qui auraient pu prévenir cette attaque.
                              </p>
                              
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-white">Sélectionnez les mesures qui auraient été les plus efficaces :</p>
                                <div className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="vpn-mfa" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="vpn-mfa" className="text-xs text-blue-200">
                                        Authentification multifacteur (MFA) sur tous les accès VPN
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="vpn-monitoring" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="vpn-monitoring" className="text-xs text-blue-200">
                                        Surveillance renforcée des connexions VPN inhabituelles
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="vpn-segmentation" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="vpn-segmentation" className="text-xs text-blue-200">
                                        Segmentation réseau limitant les accès depuis le VPN
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="backup-offline" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="backup-offline" className="text-xs text-blue-200">
                                        Sauvegardes hors ligne régulières des systèmes critiques
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="incident-response" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="incident-response" className="text-xs text-blue-200">
                                        Plan de réponse aux incidents testé régulièrement
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                                
                                <textarea 
                                  placeholder="Expliquez comment ces mesures auraient pu empêcher l'attaque sur Colonial Pipeline..."
                                  className="w-full p-2 mt-3 bg-blue-900/20 border border-blue-800/40 rounded text-xs text-blue-200 h-20"
                                />
                                
                                <Button
                                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
                                  onClick={() => {
                                    const mfaChecked = (document.getElementById('vpn-mfa') as HTMLInputElement)?.checked;
                                    const monitoringChecked = (document.getElementById('vpn-monitoring') as HTMLInputElement)?.checked;
                                    const segmentationChecked = (document.getElementById('vpn-segmentation') as HTMLInputElement)?.checked;
                                    const backupChecked = (document.getElementById('backup-offline') as HTMLInputElement)?.checked;
                                    const incidentChecked = (document.getElementById('incident-response') as HTMLInputElement)?.checked;
                                    
                                    // Compte le nombre de bonnes réponses
                                    let score = 0;
                                    if (mfaChecked) score++; // MFA est crucial
                                    if (monitoringChecked) score++; // La surveillance aurait pu détecter l'intrusion
                                    if (segmentationChecked) score++; // La segmentation aurait limité la propagation
                                    
                                    let feedback = "";
                                    if (score >= 3 && backupChecked && incidentChecked) {
                                      feedback = "Excellente analyse ! Vous avez identifié les mesures clés qui auraient pu prévenir ou limiter l'impact de l'attaque contre Colonial Pipeline. L'authentification MFA aurait empêché l'accès initial via le compte VPN compromis, la surveillance aurait détecté les comportements anormaux, et la segmentation réseau aurait limité la propagation du ransomware. Les sauvegardes hors ligne et un plan de réponse aux incidents auraient également réduit considérablement le temps de reprise.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-0')) {
                                        setUserPoints(prev => prev + 25);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-0']);
                                        
                                        toast({
                                          title: "Analyse de cas réussie !",
                                          description: "+25 points pour votre excellente analyse du cas Colonial Pipeline",
                                        });
                                      }
                                    } else if (score >= 2) {
                                      feedback = "Bonne analyse ! Vous avez identifié plusieurs mesures importantes. L'authentification MFA sur le VPN aurait été particulièrement cruciale pour empêcher l'accès initial des attaquants. Considérez également l'importance de la segmentation réseau pour limiter la propagation latérale et des sauvegardes hors ligne pour faciliter la reprise après un ransomware.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-0')) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-0']);
                                        
                                        toast({
                                          title: "Analyse de cas complétée !",
                                          description: "+15 points pour votre analyse du cas Colonial Pipeline",
                                        });
                                      }
                                    } else {
                                      feedback = "Vous avez identifié quelques mesures pertinentes, mais n'oubliez pas que la compromission initiale de Colonial Pipeline s'est faite via un compte VPN sans MFA. L'authentification multifacteur, la surveillance des connexions et la segmentation réseau sont des éléments essentiels pour prévenir ce type d'attaque. Les sauvegardes hors ligne sont également cruciales pour se remettre d'un ransomware.";
                                    }
                                    
                                    setExerciseData({
                                      ...exerciseData,
                                      caseStudyAnalysis: score.toString(),
                                      caseStudyFeedback: feedback
                                    });
                                  }}
                                >
                                  Analyser mes réponses
                                </Button>
                                
                                {exerciseData.caseStudyFeedback && selectedCaseStudy === 0 && (
                                  <div className="mt-3 p-3 bg-purple-900/30 border border-purple-700/50 rounded-md">
                                    <h5 className="text-xs font-medium text-white mb-1 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                      Feedback sur votre analyse
                                    </h5>
                                    <p className="text-xs text-blue-200">
                                      {exerciseData.caseStudyFeedback}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-purple-800/30">
                                      <p className="text-xs text-purple-300 font-medium">Impact de l'attaque Colonial Pipeline :</p>
                                      <ul className="list-disc pl-4 mt-1 text-xs text-blue-200 space-y-1">
                                        <li>Arrêt complet du pipeline pendant 6 jours</li>
                                        <li>Pénurie de carburant dans plusieurs États américains</li>
                                        <li>Hausse des prix du carburant de 8% en moyenne</li>
                                        <li>Rançon payée : 4,4 millions de dollars (partiellement récupérée)</li>
                                        <li>Dommages à la réputation et perte de confiance des consommateurs</li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {selectedCaseStudy === 1 && (
                            <div className="space-y-3">
                              <p className="text-sm text-blue-200">
                                Analysez la sophistication de l'attaque SolarWinds et identifiez les mesures qui auraient pu la détecter ou la prévenir.
                              </p>
                              
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-white">Sélectionnez les mesures qui auraient été les plus efficaces :</p>
                                <div className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="code-review" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="code-review" className="text-xs text-blue-200">
                                        Audits de code renforcés avant chaque mise en production
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="supply-chain" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="supply-chain" className="text-xs text-blue-200">
                                        Vérification cryptographique de l'intégrité des mises à jour logicielles
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="zero-trust" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="zero-trust" className="text-xs text-blue-200">
                                        Architecture Zero Trust limitant l'accès aux ressources sensibles
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="behavior-analysis" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="behavior-analysis" className="text-xs text-blue-200">
                                        Analyse comportementale des applications pour détecter les activités anormales
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="vendor-assessment" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="vendor-assessment" className="text-xs text-blue-200">
                                        Évaluation rigoureuse de sécurité des fournisseurs de logiciels
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                                
                                <textarea 
                                  placeholder="Expliquez comment ces mesures auraient pu détecter ou prévenir l'attaque SolarWinds..."
                                  className="w-full p-2 mt-3 bg-blue-900/20 border border-blue-800/40 rounded text-xs text-blue-200 h-20"
                                />
                                
                                <Button
                                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
                                  onClick={() => {
                                    const codeReviewChecked = (document.getElementById('code-review') as HTMLInputElement)?.checked;
                                    const supplyChainChecked = (document.getElementById('supply-chain') as HTMLInputElement)?.checked;
                                    const zeroTrustChecked = (document.getElementById('zero-trust') as HTMLInputElement)?.checked;
                                    const behaviorChecked = (document.getElementById('behavior-analysis') as HTMLInputElement)?.checked;
                                    const vendorChecked = (document.getElementById('vendor-assessment') as HTMLInputElement)?.checked;
                                    
                                    // Compte le nombre de bonnes réponses
                                    let score = 0;
                                    if (supplyChainChecked) score++; // Critique pour détecter la modification
                                    if (behaviorChecked) score++; // Pour détecter des comportements anormaux
                                    if (vendorChecked) score++; // Pour évaluer la sécurité du fournisseur
                                    
                                    let feedback = "";
                                    if (score >= 3 && codeReviewChecked && zeroTrustChecked) {
                                      feedback = "Excellente analyse ! Vous avez identifié les principales mesures qui auraient pu détecter ou limiter l'impact de l'attaque SolarWinds. La vérification cryptographique des mises à jour aurait pu révéler l'altération du code, tandis que l'analyse comportementale aurait pu détecter les communications suspectes. L'approche Zero Trust et l'évaluation des fournisseurs sont également essentielles pour limiter les dégâts potentiels de ce type d'attaque sophistiquée de la chaîne d'approvisionnement.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-1')) {
                                        setUserPoints(prev => prev + 25);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-1']);
                                        
                                        toast({
                                          title: "Analyse de cas réussie !",
                                          description: "+25 points pour votre excellente analyse du cas SolarWinds",
                                        });
                                      }
                                    } else if (score >= 2) {
                                      feedback = "Bonne analyse ! Vous avez identifié plusieurs mesures importantes pour lutter contre ce type d'attaque sophistiquée. La vérification cryptographique de l'intégrité des mises à jour et l'analyse comportementale sont particulièrement importantes pour détecter les modifications malveillantes dans la chaîne d'approvisionnement logicielle. N'oubliez pas l'importance d'une évaluation rigoureuse des fournisseurs.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-1')) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-1']);
                                        
                                        toast({
                                          title: "Analyse de cas complétée !",
                                          description: "+15 points pour votre analyse du cas SolarWinds",
                                        });
                                      }
                                    } else {
                                      feedback = "Vous avez identifié quelques mesures pertinentes, mais la protection contre une attaque aussi sophistiquée que SolarWinds nécessite une approche multicouche. La vérification cryptographique de l'intégrité des mises à jour est essentielle pour détecter les modifications malveillantes dans le code. L'analyse comportementale et l'évaluation des fournisseurs sont également cruciales pour cette menace avancée.";
                                    }
                                    
                                    setExerciseData({
                                      ...exerciseData,
                                      caseStudyAnalysis: score.toString(),
                                      caseStudyFeedback: feedback
                                    });
                                  }}
                                >
                                  Analyser mes réponses
                                </Button>
                                
                                {exerciseData.caseStudyFeedback && selectedCaseStudy === 1 && (
                                  <div className="mt-3 p-3 bg-purple-900/30 border border-purple-700/50 rounded-md">
                                    <h5 className="text-xs font-medium text-white mb-1 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                      Feedback sur votre analyse
                                    </h5>
                                    <p className="text-xs text-blue-200">
                                      {exerciseData.caseStudyFeedback}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-purple-800/30">
                                      <p className="text-xs text-purple-300 font-medium">Impact de l'attaque SolarWinds :</p>
                                      <ul className="list-disc pl-4 mt-1 text-xs text-blue-200 space-y-1">
                                        <li>Plus de 18 000 organisations compromises, dont de nombreuses agences gouvernementales</li>
                                        <li>Accès non détecté pendant plusieurs mois (stealth parfaite)</li>
                                        <li>Vol de données sensibles et d'informations classifiées</li>
                                        <li>Coût estimé des dommages : plusieurs milliards de dollars</li>
                                        <li>Remise en question fondamentale de la sécurité de la chaîne d'approvisionnement logicielle</li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {selectedCaseStudy === 2 && (
                            <div className="space-y-3">
                              <p className="text-sm text-blue-200">
                                Analysez la vulnérabilité Log4j et identifiez les mesures de sécurité qui auraient pu réduire son impact.
                              </p>
                              
                              <div className="space-y-2 mt-3">
                                <p className="text-xs font-medium text-white">Sélectionnez les mesures qui auraient été les plus efficaces :</p>
                                <div className="space-y-2">
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="dependency-scanning" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="dependency-scanning" className="text-xs text-blue-200">
                                        Analyse automatisée des dépendances pour identifier les composants vulnérables
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="patch-management" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="patch-management" className="text-xs text-blue-200">
                                        Processus accéléré de gestion des correctifs pour les vulnérabilités critiques
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="waf-implementation" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="waf-implementation" className="text-xs text-blue-200">
                                        Déploiement de WAF (Web Application Firewall) avec règles spécifiques
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="inventory-management" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="inventory-management" className="text-xs text-blue-200">
                                        Inventaire complet et à jour de tous les actifs logiciels et leurs composants
                                      </Label>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-2">
                                    <Checkbox id="runtime-protection" />
                                    <div className="grid gap-1">
                                      <Label htmlFor="runtime-protection" className="text-xs text-blue-200">
                                        Protection à l'exécution pour bloquer les comportements suspects des applications
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                                
                                <textarea 
                                  placeholder="Expliquez comment ces mesures auraient pu limiter l'impact de la vulnérabilité Log4j..."
                                  className="w-full p-2 mt-3 bg-blue-900/20 border border-blue-800/40 rounded text-xs text-blue-200 h-20"
                                />
                                
                                <Button
                                  className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
                                  onClick={() => {
                                    const dependencyChecked = (document.getElementById('dependency-scanning') as HTMLInputElement)?.checked;
                                    const patchChecked = (document.getElementById('patch-management') as HTMLInputElement)?.checked;
                                    const wafChecked = (document.getElementById('waf-implementation') as HTMLInputElement)?.checked;
                                    const inventoryChecked = (document.getElementById('inventory-management') as HTMLInputElement)?.checked;
                                    const runtimeChecked = (document.getElementById('runtime-protection') as HTMLInputElement)?.checked;
                                    
                                    // Compte le nombre de bonnes réponses
                                    let score = 0;
                                    if (dependencyChecked) score++; // Critique pour identifier les composants vulnérables
                                    if (wafChecked) score++; // Pour bloquer les tentatives d'exploitation
                                    if (inventoryChecked) score++; // Pour savoir où se trouve Log4j
                                    
                                    let feedback = "";
                                    if (score >= 3 && patchChecked && runtimeChecked) {
                                      feedback = "Excellente analyse ! Vous avez identifié les mesures clés pour gérer efficacement une vulnérabilité comme Log4j. L'analyse des dépendances et l'inventaire complet des actifs sont cruciaux pour identifier rapidement où se trouve Log4j dans l'infrastructure. Un WAF correctement configuré aurait bloqué de nombreuses tentatives d'exploitation, tandis que le processus accéléré de correctifs et la protection à l'exécution auraient fourni des défenses supplémentaires essentielles.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-2')) {
                                        setUserPoints(prev => prev + 25);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-2']);
                                        
                                        toast({
                                          title: "Analyse de cas réussie !",
                                          description: "+25 points pour votre excellente analyse du cas Log4j",
                                        });
                                      }
                                    } else if (score >= 2) {
                                      feedback = "Bonne analyse ! Vous avez identifié plusieurs mesures importantes pour faire face à une vulnérabilité critique comme Log4j. L'analyse des dépendances et l'inventaire des actifs sont particulièrement importants pour localiser rapidement les composants vulnérables. N'oubliez pas l'importance d'un WAF pour bloquer les tentatives d'exploitation et d'un processus de correction accéléré.";
                                      
                                      if (!completedInteractions.includes('case-study-analysis-2')) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, 'case-study-analysis-2']);
                                        
                                        toast({
                                          title: "Analyse de cas complétée !",
                                          description: "+15 points pour votre analyse du cas Log4j",
                                        });
                                      }
                                    } else {
                                      feedback = "Vous avez identifié quelques mesures pertinentes, mais la gestion d'une vulnérabilité omniprésente comme Log4j nécessite une approche complète. L'analyse des dépendances et l'inventaire des actifs sont essentiels pour savoir où se trouve Log4j dans votre infrastructure. Un WAF bien configuré et un processus de correctifs accéléré sont également cruciaux pour limiter l'exposition.";
                                    }
                                    
                                    setExerciseData({
                                      ...exerciseData,
                                      caseStudyAnalysis: score.toString(),
                                      caseStudyFeedback: feedback
                                    });
                                  }}
                                >
                                  Analyser mes réponses
                                </Button>
                                
                                {exerciseData.caseStudyFeedback && selectedCaseStudy === 2 && (
                                  <div className="mt-3 p-3 bg-purple-900/30 border border-purple-700/50 rounded-md">
                                    <h5 className="text-xs font-medium text-white mb-1 flex items-center">
                                      <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                      Feedback sur votre analyse
                                    </h5>
                                    <p className="text-xs text-blue-200">
                                      {exerciseData.caseStudyFeedback}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-purple-800/30">
                                      <p className="text-xs text-purple-300 font-medium">Impact de la vulnérabilité Log4j :</p>
                                      <ul className="list-disc pl-4 mt-1 text-xs text-blue-200 space-y-1">
                                        <li>Des millions de systèmes vulnérables à travers le monde</li>
                                        <li>Exploitation massive quelques heures après la divulgation</li>
                                        <li>Difficulté à identifier tous les systèmes affectés en raison de dépendances imbriquées</li>
                                        <li>Nombreuses campagnes d'attaques : cryptomining, ransomware, exfiltration de données</li>
                                        <li>Des années seront nécessaires pour corriger complètement toutes les instances</li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Zone de chat avec l'expert en cybersécurité */}
                        {showMiniGameChat && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white flex items-center">
                                <BrainCircuit className="h-5 w-5 text-green-400 mr-2" />
                                Validation par l'expert
                              </h4>
                              <Badge className="bg-green-600/70">
                                <Cpu className="h-3 w-3 mr-1" />
                                IA CONNECTÉE
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-blue-200 mb-3">
                              Soumettez votre analyse à notre expert en cybersécurité pour obtenir une évaluation détaillée.
                            </p>
                            
                            {/* Historique des messages du chat */}
                            {miniGameChatHistory.length > 0 && (
                              <div className="max-h-60 overflow-y-auto p-3 bg-blue-950/70 rounded border border-blue-800/50 mb-3 space-y-3">
                                {miniGameChatHistory.map((msg, index) => (
                                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2 rounded ${
                                      msg.role === 'user' 
                                        ? 'bg-blue-600/50 text-white' 
                                        : 'bg-blue-900/70 text-blue-200'
                                    }`}>
                                      <p className="text-xs whitespace-pre-line">{msg.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Interface de saisie pour le chat */}
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Décrivez votre approche en tant que RSSI..."
                                  className="bg-blue-900/50 border-blue-700 text-white text-sm"
                                  value={miniGameChatPrompt}
                                  onChange={(e) => setMiniGameChatPrompt(e.target.value)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isGeneratingMiniGameChat || !miniGameChatPrompt.trim()}
                                  className="whitespace-nowrap text-green-300 border-green-800/50 hover:bg-green-800/30"
                                  onClick={async () => {
                                    // Utiliser l'API Azure OpenAI
                                    setIsGeneratingMiniGameChat(true);
                                    
                                    // Ajouter le message de l'utilisateur à l'historique
                                    const newHistory = [...miniGameChatHistory, { role: 'user', content: miniGameChatPrompt }];
                                    setMiniGameChatHistory(newHistory);
                                    
                                    try {
                                      // Préparer le contexte spécifique au mini-jeu et au cas d'étude
                                      let contextInfo = "";
                                      
                                      // Contexte pour le type de mini-jeu sélectionné
                                      if (selectedMiniGame === "rssi") {
                                        contextInfo += "Contexte: L'utilisateur joue le rôle d'un RSSI (Responsable Sécurité des Systèmes d'Information) et doit proposer des mesures préventives. ";
                                      } else if (selectedMiniGame === "scenario") {
                                        contextInfo += "Contexte: L'utilisateur gère une crise de cybersécurité en cours et doit proposer des mesures de confinement et de communication. ";
                                      } else if (selectedMiniGame === "analyse") {
                                        contextInfo += "Contexte: L'utilisateur effectue une analyse technique des indicateurs de compromission (IOC) et doit proposer des solutions de détection et de prévention. ";
                                      }
                                      
                                      // Contexte pour le cas d'étude sélectionné
                                      if (selectedCaseStudy === 0) {
                                        contextInfo += "Cas étudié: Ransomware Colonial Pipeline (2021) - Compromission via compte VPN sans MFA. ";
                                      } else if (selectedCaseStudy === 1) {
                                        contextInfo += "Cas étudié: Cyberattaque SolarWinds (2020-2021) - Attaque sophistiquée de la chaîne d'approvisionnement. ";
                                      } else {
                                        contextInfo += "Cas étudié: Vulnérabilité Log4Shell (2021) - Exploitation d'une faille critique dans une bibliothèque open-source. ";
                                      }
                                      
                                      // Appel à l'API
                                      const response = await fetch('/api/openai/chat', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          messages: [
                                            {
                                              role: 'system',
                                              content: `Tu es un expert en cybersécurité de haut niveau qui évalue rigoureusement les connaissances en cybersécurité avec un niveau d'exigence élevé.
                                              
                                              ${contextInfo}
                                              
                                              Tu dois SYSTÉMATIQUEMENT:
                                              1. Analyser avec précision la pertinence technique des réponses de l'utilisateur selon les standards de l'industrie.
                                              2. Attribuer une note sur 5 en conclusion de chaque analyse avec une justification détaillée.
                                              3. Identifier clairement les erreurs ou les concepts mal compris par l'utilisateur.
                                              4. Suggérer des améliorations spécifiques et mesurables avec des références aux normes et bonnes pratiques actuelles.
                                              
                                              Utilise systématiquement cette structure d'évaluation:
                                              1. Points forts (concepts bien maîtrisés)
                                              2. Points à améliorer (lacunes ou erreurs)
                                              3. Recommandations concrètes basées sur les standards du secteur
                                              4. Note globale (/5) avec justification
                                              
                                              Tes réponses doivent être rigoureuses, techniques et précises. Utilise toujours la terminologie exacte du domaine de la cybersécurité.`
                                            },
                                            ...newHistory.map(msg => ({
                                              role: msg.role,
                                              content: msg.content
                                            }))
                                          ],
                                          temperature: 0.3, // Température réduite pour des réponses plus précises et cohérentes
                                          max_tokens: 1000
                                        }),
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error(`Erreur API: ${response.status}`);
                                      }
                                      
                                      const data = await response.json();
                                      const aiContent = data.choices?.[0]?.message?.content || 
                                        "Je ne peux pas évaluer votre réponse actuellement. Veuillez réessayer.";
                                      
                                      // Ajouter des points pour utilisation de l'IA
                                      if (!completedInteractions.includes(`minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`)) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, `minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`]);
                                        
                                        toast({
                                          title: "Validation experte obtenue !",
                                          description: "+15 points pour l'analyse validée par l'expert"
                                        });
                                      }
                                      
                                      // Ajouter la réponse à l'historique
                                      setMiniGameChatHistory([...newHistory, { role: 'assistant', content: aiContent }]);
                                      
                                    } catch (error) {
                                      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
                                      
                                      // Ajouter un message d'erreur à l'historique
                                      setMiniGameChatHistory([...newHistory, { 
                                        role: 'assistant', 
                                        content: "Désolé, je n'ai pas pu analyser votre réponse en raison d'un problème technique. Veuillez réessayer." 
                                      }]);
                                      
                                      toast({
                                        title: "Erreur de connexion",
                                        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
                                        variant: "destructive"
                                      });
                                    } finally {
                                      setMiniGameChatPrompt("");
                                      setIsGeneratingMiniGameChat(false);
                                    }
                                  }}
                                >
                                  {isGeneratingMiniGameChat ? (
                                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                                  ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {isGeneratingMiniGameChat ? "Analyse..." : "Envoyer"}
                                </Button>
                              </div>
                              
                              <p className="text-xs text-gray-400 text-center">
                                Nos experts en cybersécurité sont propulsés par une IA avancée
                              </p>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-300 border-green-800/50 hover:bg-green-800/30"
                            onClick={() => setShowMiniGameChat(!showMiniGameChat)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                            {showMiniGameChat ? "Masquer le chat" : "Discuter avec l'expert pour valider"}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-300 border-red-800/50 hover:bg-red-800/30"
                            onClick={() => {
                              setMiniGameChatHistory([]);
                              toast({
                                title: "Historique effacé",
                                description: "L'historique des messages a été réinitialisé"
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                            Réinitialiser
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Mini-jeu 2: Scénario de crise */}
                    {selectedMiniGame === "scenario" && (
                      <div className="space-y-4">
                        <p className="text-sm text-blue-200">
                          Vous êtes en pleine crise suite à une attaque similaire à celle de {selectedCaseStudy === 0 ? "Colonial Pipeline" : selectedCaseStudy === 1 ? "SolarWinds" : "Log4Shell"}. 
                          Comment organiseriez-vous la réponse à l'incident et la communication de crise ?
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-red-900/20 rounded-lg border border-red-800/50">
                            <h4 className="font-medium text-white mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                              Phase 1: Confinement
                            </h4>
                            <p className="text-xs text-blue-200">
                              {selectedCaseStudy === 0 ? 
                                "Le ransomware se propage dans votre réseau. Quelles mesures immédiates prenez-vous pour limiter sa propagation ?" :
                                selectedCaseStudy === 1 ? 
                                "Des logiciels compromis ont été détectés sur vos systèmes critiques. Comment isolez-vous les systèmes affectés ?" :
                                "Vos serveurs exposent la vulnérabilité Log4Shell. Comment réduisez-vous l'exposition immédiate ?"}
                            </p>
                          </div>
                          
                          <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-800/50">
                            <h4 className="font-medium text-white mb-2 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-amber-400" />
                              Phase 2: Communication
                            </h4>
                            <p className="text-xs text-blue-200">
                              Qui allez-vous informer en priorité et quel message allez-vous communiquer aux différentes parties prenantes ?
                            </p>
                          </div>
                        </div>
                        
                        {/* Zone de chat avec l'expert en cybersécurité */}
                        {showMiniGameChat && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white flex items-center">
                                <BrainCircuit className="h-5 w-5 text-green-400 mr-2" />
                                Validation par l'expert
                              </h4>
                              <Badge className="bg-green-600/70">
                                <Cpu className="h-3 w-3 mr-1" />
                                IA CONNECTÉE
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-blue-200 mb-3">
                              Soumettez votre plan de gestion de crise à notre expert en cybersécurité pour obtenir une évaluation détaillée.
                            </p>
                            
                            {/* Historique des messages du chat */}
                            {miniGameChatHistory.length > 0 && (
                              <div className="max-h-60 overflow-y-auto p-3 bg-blue-950/70 rounded border border-blue-800/50 mb-3 space-y-3">
                                {miniGameChatHistory.map((msg, index) => (
                                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2 rounded ${
                                      msg.role === 'user' 
                                        ? 'bg-blue-600/50 text-white' 
                                        : 'bg-blue-900/70 text-blue-200'
                                    }`}>
                                      <p className="text-xs whitespace-pre-line">{msg.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Interface de saisie pour le chat */}
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Décrivez votre plan de gestion de crise..."
                                  className="bg-blue-900/50 border-blue-700 text-white text-sm"
                                  value={miniGameChatPrompt}
                                  onChange={(e) => setMiniGameChatPrompt(e.target.value)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isGeneratingMiniGameChat || !miniGameChatPrompt.trim()}
                                  className="whitespace-nowrap text-green-300 border-green-800/50 hover:bg-green-800/30"
                                  onClick={async () => {
                                    // Utiliser l'API Azure OpenAI
                                    setIsGeneratingMiniGameChat(true);
                                    
                                    // Ajouter le message de l'utilisateur à l'historique
                                    const newHistory = [...miniGameChatHistory, { role: 'user', content: miniGameChatPrompt }];
                                    setMiniGameChatHistory(newHistory);
                                    
                                    try {
                                      // Préparer le contexte spécifique au mini-jeu et au cas d'étude
                                      let contextInfo = "";
                                      
                                      // Contexte pour le type de mini-jeu sélectionné
                                      contextInfo += "Contexte: L'utilisateur gère une crise de cybersécurité en cours et doit proposer des mesures de confinement et de communication. ";
                                      
                                      // Contexte pour le cas d'étude sélectionné
                                      if (selectedCaseStudy === 0) {
                                        contextInfo += "Cas étudié: Ransomware Colonial Pipeline (2021) - Compromission via compte VPN sans MFA. ";
                                      } else if (selectedCaseStudy === 1) {
                                        contextInfo += "Cas étudié: Cyberattaque SolarWinds (2020-2021) - Attaque sophistiquée de la chaîne d'approvisionnement. ";
                                      } else {
                                        contextInfo += "Cas étudié: Vulnérabilité Log4Shell (2021) - Exploitation d'une faille critique dans une bibliothèque open-source. ";
                                      }
                                      
                                      // Appel à l'API
                                      const response = await fetch('/api/openai/chat', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          messages: [
                                            {
                                              role: 'system',
                                              content: `Tu es un expert en cybersécurité de haut niveau qui évalue rigoureusement les connaissances en cybersécurité avec un niveau d'exigence élevé.
                                              
                                              ${contextInfo}
                                              
                                              Tu dois SYSTÉMATIQUEMENT:
                                              1. Analyser avec précision la pertinence technique des réponses de l'utilisateur selon les standards de l'industrie.
                                              2. Attribuer une note sur 5 en conclusion de chaque analyse avec une justification détaillée.
                                              3. Identifier clairement les erreurs ou les concepts mal compris par l'utilisateur.
                                              4. Suggérer des améliorations spécifiques et mesurables avec des références aux normes et bonnes pratiques actuelles.
                                              
                                              Utilise systématiquement cette structure d'évaluation:
                                              1. Points forts (concepts bien maîtrisés)
                                              2. Points à améliorer (lacunes ou erreurs)
                                              3. Recommandations concrètes basées sur les standards du secteur
                                              4. Note globale (/5) avec justification
                                              
                                              Tes réponses doivent être rigoureuses, techniques et précises. Utilise toujours la terminologie exacte du domaine de la cybersécurité.`
                                            },
                                            ...newHistory.map(msg => ({
                                              role: msg.role,
                                              content: msg.content
                                            }))
                                          ],
                                          temperature: 0.3, // Température réduite pour des réponses plus précises et cohérentes
                                          max_tokens: 1000
                                        }),
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error(`Erreur API: ${response.status}`);
                                      }
                                      
                                      const data = await response.json();
                                      const aiContent = data.choices?.[0]?.message?.content || 
                                        "Je ne peux pas évaluer votre réponse actuellement. Veuillez réessayer.";
                                      
                                      // Ajouter des points pour utilisation de l'IA
                                      if (!completedInteractions.includes(`minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`)) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, `minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`]);
                                        
                                        toast({
                                          title: "Validation experte obtenue !",
                                          description: "+15 points pour l'analyse validée par l'expert"
                                        });
                                      }
                                      
                                      // Ajouter la réponse à l'historique
                                      setMiniGameChatHistory([...newHistory, { role: 'assistant', content: aiContent }]);
                                      
                                    } catch (error) {
                                      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
                                      
                                      // Ajouter un message d'erreur à l'historique
                                      setMiniGameChatHistory([...newHistory, { 
                                        role: 'assistant', 
                                        content: "Désolé, je n'ai pas pu analyser votre réponse en raison d'un problème technique. Veuillez réessayer." 
                                      }]);
                                      
                                      toast({
                                        title: "Erreur de connexion",
                                        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
                                        variant: "destructive"
                                      });
                                    } finally {
                                      setMiniGameChatPrompt("");
                                      setIsGeneratingMiniGameChat(false);
                                    }
                                  }}
                                >
                                  {isGeneratingMiniGameChat ? (
                                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                                  ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {isGeneratingMiniGameChat ? "Analyse..." : "Envoyer"}
                                </Button>
                              </div>
                              
                              <p className="text-xs text-gray-400 text-center">
                                Nos experts en cybersécurité sont propulsés par une IA avancée
                              </p>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-300 border-green-800/50 hover:bg-green-800/30"
                            onClick={() => setShowMiniGameChat(!showMiniGameChat)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                            {showMiniGameChat ? "Masquer le chat" : "Discuter avec l'expert pour valider"}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-300 border-red-800/50 hover:bg-red-800/30"
                            onClick={() => {
                              setMiniGameChatHistory([]);
                              toast({
                                title: "Historique effacé",
                                description: "L'historique des messages a été réinitialisé"
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                            Réinitialiser
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Mini-jeu 3: Analyse technique */}
                    {selectedMiniGame === "analyse" && (
                      <div className="space-y-4">
                        <p className="text-sm text-blue-200">
                          Analysez les indicateurs de compromission (IOCs) et les techniques d'attaque utilisées dans ce cas. 
                          Quelles solutions techniques recommanderiez-vous pour détecter et prévenir de telles attaques ?
                        </p>
                        
                        <div className="p-4 bg-blue-950/70 rounded-lg border border-blue-800/50 mb-4">
                          <h4 className="font-medium text-white mb-2">Indicateurs de compromission</h4>
                          {selectedCaseStudy === 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">IP:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">185.243.115.140</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Hash:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">5d6accea4879d66d9a40c3a4e7188f690aace80e</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Domaine:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">darkside-cdn.noc4.net</code>
                              </div>
                            </div>
                          )}
                          {selectedCaseStudy === 1 && (
                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Hash:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">019085a76ba7126fff22770d71bd901c325fc68ac55aa743327984e89f4b0134</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Domaine:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">avsvmcloud.com</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Fichier:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">SolarWinds.Orion.Core.BusinessLayer.dll</code>
                              </div>
                            </div>
                          )}
                          {selectedCaseStudy === 2 && (
                            <div className="space-y-2">
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Pattern:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">{"JNDI:LDAP://malicious-domain.com/exploit"}</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">CVE:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">CVE-2021-44228</code>
                              </div>
                              <div className="flex items-center text-xs text-blue-200">
                                <span className="inline-block w-16 font-mono">Version:</span>
                                <code className="bg-blue-900/50 px-2 py-0.5 rounded">log4j-core 2.0-2.14.1</code>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Zone de chat avec l'expert en cybersécurité */}
                        {showMiniGameChat && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white flex items-center">
                                <BrainCircuit className="h-5 w-5 text-green-400 mr-2" />
                                Validation par l'expert
                              </h4>
                              <Badge className="bg-green-600/70">
                                <Cpu className="h-3 w-3 mr-1" />
                                IA CONNECTÉE
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-blue-200 mb-3">
                              Soumettez votre analyse technique des IOCs à notre expert en cybersécurité pour obtenir une évaluation détaillée.
                            </p>
                            
                            {/* Historique des messages du chat */}
                            {miniGameChatHistory.length > 0 && (
                              <div className="max-h-60 overflow-y-auto p-3 bg-blue-950/70 rounded border border-blue-800/50 mb-3 space-y-3">
                                {miniGameChatHistory.map((msg, index) => (
                                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2 rounded ${
                                      msg.role === 'user' 
                                        ? 'bg-blue-600/50 text-white' 
                                        : 'bg-blue-900/70 text-blue-200'
                                    }`}>
                                      <p className="text-xs whitespace-pre-line">{msg.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Interface de saisie pour le chat */}
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Décrivez votre analyse technique et vos recommandations..."
                                  className="bg-blue-900/50 border-blue-700 text-white text-sm"
                                  value={miniGameChatPrompt}
                                  onChange={(e) => setMiniGameChatPrompt(e.target.value)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isGeneratingMiniGameChat || !miniGameChatPrompt.trim()}
                                  className="whitespace-nowrap text-green-300 border-green-800/50 hover:bg-green-800/30"
                                  onClick={async () => {
                                    // Utiliser l'API Azure OpenAI
                                    setIsGeneratingMiniGameChat(true);
                                    
                                    // Ajouter le message de l'utilisateur à l'historique
                                    const newHistory = [...miniGameChatHistory, { role: 'user', content: miniGameChatPrompt }];
                                    setMiniGameChatHistory(newHistory);
                                    
                                    try {
                                      // Préparer le contexte spécifique au mini-jeu et au cas d'étude
                                      let contextInfo = "";
                                      
                                      // Contexte pour le type de mini-jeu sélectionné
                                      contextInfo += "Contexte: L'utilisateur effectue une analyse technique des indicateurs de compromission (IOC) et doit proposer des solutions de détection et de prévention. ";
                                      
                                      // Contexte pour le cas d'étude sélectionné
                                      if (selectedCaseStudy === 0) {
                                        contextInfo += "Cas étudié: Ransomware Colonial Pipeline (2021) - Compromission via compte VPN sans MFA. IOCs: IP 185.243.115.140, Hash 5d6accea4879d66d9a40c3a4e7188f690aace80e, Domaine darkside-cdn.noc4.net";
                                      } else if (selectedCaseStudy === 1) {
                                        contextInfo += "Cas étudié: Cyberattaque SolarWinds (2020-2021) - Attaque sophistiquée de la chaîne d'approvisionnement. IOCs: Hash 019085a76ba7126fff22770d71bd901c325fc68ac55aa743327984e89f4b0134, Domaine avsvmcloud.com, Fichier SolarWinds.Orion.Core.BusinessLayer.dll";
                                      } else {
                                        contextInfo += "Cas étudié: Vulnérabilité Log4Shell (2021) - Exploitation d'une faille critique dans une bibliothèque open-source. IOCs: Pattern JNDI:LDAP://malicious-domain.com/exploit, CVE-2021-44228, Version log4j-core 2.0-2.14.1";
                                      }
                                      
                                      // Appel à l'API
                                      const response = await fetch('/api/openai/chat', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          messages: [
                                            {
                                              role: 'system',
                                              content: `Tu es un expert en cybersécurité de haut niveau qui évalue rigoureusement les connaissances en cybersécurité avec un niveau d'exigence élevé.
                                              
                                              ${contextInfo}
                                              
                                              Tu dois SYSTÉMATIQUEMENT:
                                              1. Analyser avec précision la pertinence technique des réponses de l'utilisateur selon les standards de l'industrie.
                                              2. Attribuer une note sur 5 en conclusion de chaque analyse avec une justification détaillée.
                                              3. Identifier clairement les erreurs ou les concepts mal compris par l'utilisateur.
                                              4. Suggérer des améliorations spécifiques et mesurables avec des références aux normes et bonnes pratiques actuelles.
                                              
                                              Utilise systématiquement cette structure d'évaluation:
                                              1. Points forts (concepts bien maîtrisés)
                                              2. Points à améliorer (lacunes ou erreurs)
                                              3. Recommandations concrètes basées sur les standards du secteur
                                              4. Note globale (/5) avec justification
                                              
                                              Tes réponses doivent être rigoureuses, techniques et précises. Utilise toujours la terminologie exacte du domaine de la cybersécurité.`
                                            },
                                            ...newHistory.map(msg => ({
                                              role: msg.role,
                                              content: msg.content
                                            }))
                                          ],
                                          temperature: 0.3, // Température réduite pour des réponses plus précises et cohérentes
                                          max_tokens: 1000
                                        }),
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error(`Erreur API: ${response.status}`);
                                      }
                                      
                                      const data = await response.json();
                                      const aiContent = data.choices?.[0]?.message?.content || 
                                        "Je ne peux pas évaluer votre réponse actuellement. Veuillez réessayer.";
                                      
                                      // Ajouter des points pour utilisation de l'IA
                                      if (!completedInteractions.includes(`minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`)) {
                                        setUserPoints(prev => prev + 15);
                                        setCompletedInteractions(prev => [...prev, `minigame-chat-${selectedMiniGame}-${selectedCaseStudy}`]);
                                        
                                        toast({
                                          title: "Validation experte obtenue !",
                                          description: "+15 points pour l'analyse validée par l'expert"
                                        });
                                      }
                                      
                                      // Ajouter la réponse à l'historique
                                      setMiniGameChatHistory([...newHistory, { role: 'assistant', content: aiContent }]);
                                      
                                    } catch (error) {
                                      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
                                      
                                      // Ajouter un message d'erreur à l'historique
                                      setMiniGameChatHistory([...newHistory, { 
                                        role: 'assistant', 
                                        content: "Désolé, je n'ai pas pu analyser votre réponse en raison d'un problème technique. Veuillez réessayer." 
                                      }]);
                                      
                                      toast({
                                        title: "Erreur de connexion",
                                        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
                                        variant: "destructive"
                                      });
                                    } finally {
                                      setMiniGameChatPrompt("");
                                      setIsGeneratingMiniGameChat(false);
                                    }
                                  }}
                                >
                                  {isGeneratingMiniGameChat ? (
                                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                                  ) : (
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                  )}
                                  {isGeneratingMiniGameChat ? "Analyse..." : "Envoyer"}
                                </Button>
                              </div>
                              
                              <p className="text-xs text-gray-400 text-center">
                                Nos experts en cybersécurité sont propulsés par une IA avancée
                              </p>
                            </div>
                          </motion.div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-300 border-green-800/50 hover:bg-green-800/30"
                            onClick={() => setShowMiniGameChat(!showMiniGameChat)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                            {showMiniGameChat ? "Masquer le chat" : "Discuter avec l'expert pour valider"}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-300 border-red-800/50 hover:bg-red-800/30"
                            onClick={() => {
                              setMiniGameChatHistory([]);
                              toast({
                                title: "Historique effacé",
                                description: "L'historique des messages a été réinitialisé"
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                            Réinitialiser
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "glossaire" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <BookOpen className="mr-3 h-6 w-6 text-blue-400" />
                    Glossaire de la Cybersécurité
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200 mb-6">
                      Ce glossaire vous permet de maîtriser les termes essentiels de la cybersécurité. Comprendre cette terminologie 
                      est fondamental pour communiquer efficacement sur les risques et les mesures de protection.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h3 className="text-lg font-medium text-white mb-3">Terminologie fondamentale</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-blue-300">APT (Advanced Persistent Threat)</h4>
                            <p className="text-sm text-blue-200">Attaque complexe et ciblée où l'attaquant maintient une présence non détectée sur les systèmes pendant une longue période, souvent soutenue par des États.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">Blue Team / Red Team</h4>
                            <p className="text-sm text-blue-200">Équipes de sécurité aux rôles complémentaires : la Blue Team défend les systèmes, tandis que la Red Team simule des attaques pour tester les défenses.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">CERT (Computer Emergency Response Team)</h4>
                            <p className="text-sm text-blue-200">Organisation responsable de recevoir, analyser et répondre aux incidents de sécurité informatique.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">CSIRT (Computer Security Incident Response Team)</h4>
                            <p className="text-sm text-blue-200">Équipe dédiée à la gestion des incidents de sécurité informatique au sein d'une organisation.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">CVE (Common Vulnerabilities and Exposures)</h4>
                            <p className="text-sm text-blue-200">Système standardisé d'identification des vulnérabilités de sécurité connues.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h3 className="text-lg font-medium text-white mb-3">Concepts de sécurité</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-blue-300">Zero Trust</h4>
                            <p className="text-sm text-blue-200">Modèle de sécurité qui ne fait confiance à aucun utilisateur ou appareil par défaut, même à l'intérieur du périmètre du réseau, nécessitant une vérification systématique.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">Defense in Depth</h4>
                            <p className="text-sm text-blue-200">Stratégie utilisant plusieurs couches de sécurité pour protéger les ressources; si une couche est compromise, les autres continuent d'assurer la protection.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">Principe du moindre privilège</h4>
                            <p className="text-sm text-blue-200">Restriction des droits d'accès au strict minimum nécessaire pour qu'un utilisateur ou un processus accomplisse sa tâche.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">Threat Intelligence</h4>
                            <p className="text-sm text-blue-200">Collecte, analyse et utilisation d'informations sur les menaces potentielles pour améliorer les défenses de cybersécurité.</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-300">DevSecOps</h4>
                            <p className="text-sm text-blue-200">Intégration des considérations de sécurité tout au long du cycle de développement logiciel, et non seulement à la fin.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">Lexique des attaques</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-blue-300">DDoS (Distributed Denial of Service)</h4>
                          <p className="text-sm text-blue-200">Attaque visant à rendre indisponible un service en ligne en le submergeant de trafic provenant de multiples sources.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-300">Man-in-the-Middle</h4>
                          <p className="text-sm text-blue-200">Attaque où l'attaquant s'interpose dans une communication entre deux parties pour intercepter, lire ou modifier les données échangées.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-300">Phishing</h4>
                          <p className="text-sm text-blue-200">Technique d'ingénierie sociale visant à obtenir des informations sensibles en se faisant passer pour une entité de confiance.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-300">Ransomware</h4>
                          <p className="text-sm text-blue-200">Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour les déchiffrer.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-300">SQL Injection</h4>
                          <p className="text-sm text-blue-200">Méthode d'exploitation des vulnérabilités dans une application pour injecter du code SQL malveillant qui peut manipuler la base de données.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-blue-300">XSS (Cross-Site Scripting)</h4>
                          <p className="text-sm text-blue-200">Vulnérabilité permettant l'injection de code malveillant dans des pages web consultées par d'autres utilisateurs.</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      onClick={() => {
                        if (!completedInteractions.includes('glossaire-explore')) {
                          setUserPoints(prev => prev + 15);
                          setCompletedInteractions(prev => [...prev, 'glossaire-explore']);
                          
                          toast({
                            title: "Glossaire exploré !",
                            description: "+15 points pour l'exploration du glossaire cyber.",
                          });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      J'ai compris ces termes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "best-practices" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Shield className="mr-3 h-6 w-6 text-green-400" />
                    Bonnes Pratiques de Cybersécurité
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200 mb-6">
                      Ces bonnes pratiques constituent les fondements d'une protection efficace contre les cybermenaces. 
                      Leur application rigoureuse permet de réduire significativement la surface d'attaque de votre organisation.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <div className="flex items-center mb-3">
                          <Users className="h-5 w-5 text-blue-300 mr-2" />
                          <h3 className="text-lg font-medium text-white">Pour les utilisateurs</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Authentification forte</h4>
                            <p className="text-xs text-blue-200">Activez systématiquement l'authentification multifacteur (MFA) sur tous vos comptes, en particulier ceux contenant des données sensibles.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Mots de passe robustes</h4>
                            <p className="text-xs text-blue-200">Utilisez des phrases de passe complexes et uniques pour chaque service. Privilégiez un gestionnaire de mots de passe pour les stocker.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Vigilance face au phishing</h4>
                            <p className="text-xs text-blue-200">Méfiez-vous des emails, messages ou appels demandant des informations sensibles. Vérifiez toujours l'identité de l'expéditeur.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Mises à jour régulières</h4>
                            <p className="text-xs text-blue-200">Installez rapidement les mises à jour de sécurité sur tous vos appareils et applications pour corriger les vulnérabilités connues.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <div className="flex items-center mb-3">
                          <Server className="h-5 w-5 text-blue-300 mr-2" />
                          <h3 className="text-lg font-medium text-white">Pour les administrateurs</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Segmentation réseau</h4>
                            <p className="text-xs text-blue-200">Divisez votre réseau en zones distinctes pour limiter la propagation d'une compromission et isoler les systèmes critiques.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Principe du moindre privilège</h4>
                            <p className="text-xs text-blue-200">Attribuez uniquement les permissions minimales nécessaires aux utilisateurs et services pour accomplir leurs tâches.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Sauvegardes régulières</h4>
                            <p className="text-xs text-blue-200">Mettez en place un système de sauvegarde 3-2-1 : 3 copies, sur 2 supports différents, dont 1 hors site, avec tests de restauration.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Surveillance continue</h4>
                            <p className="text-xs text-blue-200">Déployez des solutions de détection et de réponse pour identifier et bloquer rapidement les activités suspectes sur votre réseau.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <div className="flex items-center mb-3">
                          <FileCheck className="h-5 w-5 text-blue-300 mr-2" />
                          <h3 className="text-lg font-medium text-white">Pour les organisations</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Formation régulière</h4>
                            <p className="text-xs text-blue-200">Sensibilisez tous les employés aux risques cyber par des formations régulières et des exercices pratiques (phishing simulé).</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Plan de réponse aux incidents</h4>
                            <p className="text-xs text-blue-200">Préparez et testez régulièrement un plan de réponse détaillant les actions à mener en cas de compromission.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Gestion des actifs</h4>
                            <p className="text-xs text-blue-200">Maintenez un inventaire à jour de tous vos actifs matériels et logiciels pour identifier et protéger l'ensemble de votre surface d'attaque.</p>
                          </div>
                          
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800/40">
                            <h4 className="font-medium text-blue-300 text-sm">Évaluations régulières</h4>
                            <p className="text-xs text-blue-200">Réalisez des audits de sécurité, tests d'intrusion et examens de conformité pour identifier et corriger les vulnérabilités.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/40 mb-6">
                      <h3 className="text-lg font-medium text-white flex items-center mb-3">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        Checklist de sécurité prioritaire
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="bg-green-800/30 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </div>
                          <p className="text-sm text-blue-200">Activer l'authentification multifacteur sur tous les comptes professionnels et personnels critiques</p>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-800/30 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </div>
                          <p className="text-sm text-blue-200">Mettre en place un système de sauvegarde automatisé et testé régulièrement</p>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-800/30 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </div>
                          <p className="text-sm text-blue-200">Configurer les mises à jour automatiques sur tous les systèmes et applications</p>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-800/30 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </div>
                          <p className="text-sm text-blue-200">Utiliser un gestionnaire de mots de passe pour créer et stocker des mots de passe uniques et complexes</p>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-green-800/30 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          </div>
                          <p className="text-sm text-blue-200">Limiter les privilèges administratifs aux seuls utilisateurs qui en ont besoin</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      onClick={() => {
                        if (!completedInteractions.includes('best-practices-explore')) {
                          setUserPoints(prev => prev + 15);
                          setCompletedInteractions(prev => [...prev, 'best-practices-explore']);
                          
                          toast({
                            title: "Bonnes pratiques maîtrisées !",
                            description: "+15 points pour l'exploration des bonnes pratiques.",
                          });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      J'ai pris connaissance de ces recommandations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "quiz" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Code className="mr-3 h-6 w-6 text-purple-400" />
                    Quiz : Testez vos connaissances
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200 mb-6">
                      Vérifiez votre compréhension des concepts fondamentaux de la cybersécurité. 
                      Répondez aux questions suivantes pour valider vos acquis.
                    </p>
                    
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q1 === correctAnswers.q1 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q1 !== correctAnswers.q1 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 1</h4>
                        <p className="text-sm text-blue-200 mb-3">Quel principe de cybersécurité vise à assurer que les données sont exactes et n'ont pas été modifiées de façon non autorisée ?</p>
                        
                        <RadioGroup value={quizAnswers.q1} onValueChange={(value) => updateQuizAnswer("q1", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "a")}`}>
                            <RadioGroupItem value="a" id="q1-a" disabled={showQuizResult} />
                            <Label htmlFor="q1-a" className="text-sm cursor-pointer">Confidentialité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "b")}`}>
                            <RadioGroupItem value="b" id="q1-b" disabled={showQuizResult} />
                            <Label htmlFor="q1-b" className="text-sm cursor-pointer">Intégrité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "c")}`}>
                            <RadioGroupItem value="c" id="q1-c" disabled={showQuizResult} />
                            <Label htmlFor="q1-c" className="text-sm cursor-pointer">Disponibilité</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q1 !== correctAnswers.q1 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> L'intégrité est le principe qui assure que les données restent exactes et complètes, sans modification non autorisée.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q2 === correctAnswers.q2 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q2 !== correctAnswers.q2 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 2</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelle approche de sécurité consiste à mettre en place plusieurs couches de protection complémentaires ?</p>
                        
                        <RadioGroup value={quizAnswers.q2} onValueChange={(value) => updateQuizAnswer("q2", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "a")}`}>
                            <RadioGroupItem value="a" id="q2-a" disabled={showQuizResult} />
                            <Label htmlFor="q2-a" className="text-sm cursor-pointer">Principe du moindre privilège</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "b")}`}>
                            <RadioGroupItem value="b" id="q2-b" disabled={showQuizResult} />
                            <Label htmlFor="q2-b" className="text-sm cursor-pointer">Sécurité par l'obscurité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "c")}`}>
                            <RadioGroupItem value="c" id="q2-c" disabled={showQuizResult} />
                            <Label htmlFor="q2-c" className="text-sm cursor-pointer">Défense en profondeur</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q2 !== correctAnswers.q2 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> La défense en profondeur consiste à mettre en place plusieurs couches de sécurité complémentaires, pour que si l'une est compromise, les autres continuent à protéger le système.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q3 === correctAnswers.q3 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q3 !== correctAnswers.q3 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 3</h4>
                        <p className="text-sm text-blue-200 mb-3">Quel type de logiciel malveillant chiffre les données de la victime et exige une rançon pour les déchiffrer ?</p>
                        
                        <RadioGroup value={quizAnswers.q3} onValueChange={(value) => updateQuizAnswer("q3", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "a")}`}>
                            <RadioGroupItem value="a" id="q3-a" disabled={showQuizResult} />
                            <Label htmlFor="q3-a" className="text-sm cursor-pointer">Ransomware</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "b")}`}>
                            <RadioGroupItem value="b" id="q3-b" disabled={showQuizResult} />
                            <Label htmlFor="q3-b" className="text-sm cursor-pointer">Spyware</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "c")}`}>
                            <RadioGroupItem value="c" id="q3-c" disabled={showQuizResult} />
                            <Label htmlFor="q3-c" className="text-sm cursor-pointer">Cheval de Troie</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q3 !== correctAnswers.q3 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Un ransomware est un logiciel malveillant qui chiffre les données de la victime et exige une rançon pour fournir la clé de déchiffrement.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q4 === correctAnswers.q4 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q4 !== correctAnswers.q4 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 4</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelle technique d'attaque implique de se faire passer pour une entité légitime afin d'obtenir des informations sensibles ?</p>
                        
                        <RadioGroup value={quizAnswers.q4} onValueChange={(value) => updateQuizAnswer("q4", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "a")}`}>
                            <RadioGroupItem value="a" id="q4-a" disabled={showQuizResult} />
                            <Label htmlFor="q4-a" className="text-sm cursor-pointer">Attaque par force brute</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "b")}`}>
                            <RadioGroupItem value="b" id="q4-b" disabled={showQuizResult} />
                            <Label htmlFor="q4-b" className="text-sm cursor-pointer">Phishing</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "c")}`}>
                            <RadioGroupItem value="c" id="q4-c" disabled={showQuizResult} />
                            <Label htmlFor="q4-c" className="text-sm cursor-pointer">Attaque par déni de service</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q4 !== correctAnswers.q4 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Le phishing est une technique d'ingénierie sociale où les attaquants se font passer pour des entités légitimes (banques, services en ligne, etc.) afin d'inciter les victimes à divulguer des informations sensibles.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q5 === correctAnswers.q5 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q5 !== correctAnswers.q5 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 5</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelles mesures devraient être prises après une violation de données ?</p>
                        
                        <RadioGroup value={quizAnswers.q5} onValueChange={(value) => updateQuizAnswer("q5", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "a")}`}>
                            <RadioGroupItem value="a" id="q5-a" disabled={showQuizResult} />
                            <Label htmlFor="q5-a" className="text-sm cursor-pointer">Notifier uniquement les utilisateurs directement affectés</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "b")}`}>
                            <RadioGroupItem value="b" id="q5-b" disabled={showQuizResult} />
                            <Label htmlFor="q5-b" className="text-sm cursor-pointer">Identifier la cause et corriger la vulnérabilité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "c")}`}>
                            <RadioGroupItem value="c" id="q5-c" disabled={showQuizResult} />
                            <Label htmlFor="q5-c" className="text-sm cursor-pointer">Toutes les mesures ci-dessus ainsi que signaler l'incident aux autorités compétentes</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q5 !== correctAnswers.q5 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Après une violation de données, il est essentiel de notifier les utilisateurs affectés, d'identifier et corriger la vulnérabilité, et dans de nombreux cas, de signaler l'incident aux autorités conformément aux lois sur la protection des données.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                      {!showQuizResult ? (
                        <Button 
                          onClick={submitQuiz}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          Valider mes réponses
                        </Button>
                      ) : (
                        <div className="text-center">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white">
                              {quizScore === 5 ? "Excellent !" : quizScore >= 4 ? "Très bien !" : quizScore >= 3 ? "Bon travail !" : "Continuez vos efforts !"}
                            </h3>
                            <p className="text-blue-200 mt-1">
                              Vous avez obtenu {quizScore}/5 bonnes réponses.
                            </p>
                          </div>
                          
                          {badgeEarned && (
                            <div className="mb-4 bg-blue-800/30 p-4 rounded-lg border border-blue-700/50 flex items-center justify-center flex-col">
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-2 px-3 py-1">
                                <CheckCircle className="mr-1 h-3 w-3" /> Badge obtenu !
                              </Badge>
                              <p className="text-sm text-blue-200">
                                Félicitations ! Vous avez débloqué le badge "Fondamentaux de la Cybersécurité".
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            onClick={resetQuiz} 
                            variant="outline"
                            className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                          >
                            Réessayer le quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-4">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Votre progression</h3>
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-sm text-blue-300">{progress}% complété</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "principes" || progress >= 25 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 25 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Principes fondamentaux</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "menaces" || progress >= 50 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 50 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Menaces actuelles</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "casreel" || progress >= 75 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 75 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Étude de cas</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "quiz" || progress >= 90 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 100 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Quiz d'évaluation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Assistant IA */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-400" />
                      Assistant IA
                    </h3>
                    
                    <Badge className="bg-blue-600/70">
                      <Sparkles className="h-3 w-3 mr-1" />
                      INTERACTIF
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-blue-300 mb-3">
                    Posez une question sur la cybersécurité et obtenez une réponse instantanée.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Interface unifiée de l'assistant IA */}
                    <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white flex items-center">
                          <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                          Discussion avec l'Expert IA
                        </h4>
                        <Badge className="bg-green-600/70">
                          <Cpu className="h-3 w-3 mr-1" />
                          IA CONNECTÉE
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-blue-200 mb-3">
                        Posez n'importe quelle question sur la cybersécurité à notre assistant IA expert.
                      </p>
                      
                      {/* Historique de conversation */}
                      {miniGameChatHistory.length > 0 && (
                        <div className="max-h-60 overflow-y-auto mb-3 space-y-3 bg-blue-950/70 p-3 rounded border border-blue-800/50">
                          {miniGameChatHistory.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-2 rounded ${
                                msg.role === 'user' 
                                  ? 'bg-blue-600/50 text-white' 
                                  : 'bg-blue-900/70 text-blue-200'
                              }`}>
                                <p className="text-xs whitespace-pre-line">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Interface de saisie */}
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Ex: Qu'est-ce qu'un ransomware?" 
                          className="bg-blue-900/30 border-blue-700 text-white"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <Button 
                          onClick={async () => {
                            if (!aiPrompt.trim()) return;
                            
                            // Ajouter le message de l'utilisateur à l'historique
                            const userMessage = { role: 'user', content: aiPrompt };
                            const newHistory = [...miniGameChatHistory, userMessage];
                            setMiniGameChatHistory(newHistory);
                            
                            // Générer la réponse
                            setIsGeneratingAI(true);
                            
                            try {
                              const response = await fetch('/api/openai/chat', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  messages: [
                                    {
                                      role: 'system',
                                      content: 'Tu es un expert en cybersécurité spécialisé dans la formation et l\'éducation. Tu fournis des réponses précises, techniques mais accessibles sur tous les sujets liés à la cybersécurité. Tes réponses doivent être informatives, instructives et basées sur les meilleures pratiques actuelles du secteur. Reste strictement dans le domaine de la cybersécurité.'
                                    },
                                    ...newHistory.map(msg => ({
                                      role: msg.role,
                                      content: msg.content
                                    }))
                                  ],
                                  temperature: 0.3,
                                  max_tokens: 800
                                }),
                              });
                              
                              if (!response.ok) {
                                throw new Error('Erreur API');
                              }
                              
                              const data = await response.json();
                              const aiContent = data.choices?.[0]?.message?.content || 
                                "Je ne peux pas répondre à cette question actuellement. Veuillez réessayer.";
                              
                              // Ajouter la réponse à l'historique
                              setMiniGameChatHistory([...newHistory, { role: 'assistant', content: aiContent }]);
                              
                              // Ajouter des points si première utilisation
                              if (!completedInteractions.includes('ai-assistant')) {
                                setUserPoints(prev => prev + 15);
                                setCompletedInteractions(prev => [...prev, 'ai-assistant']);
                                
                                toast({
                                  title: "Expert IA consulté !",
                                  description: "+15 points pour avoir dialogué avec l'expert en cybersécurité",
                                });
                              }
                            } catch (error) {
                              console.error('Erreur lors de l\'appel à l\'API:', error);
                              toast({
                                title: "Erreur de connexion",
                                description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
                                variant: "destructive"
                              });
                            } finally {
                              setAiPrompt("");
                              setIsGeneratingAI(false);
                            }
                          }}
                          disabled={isGeneratingAI || !aiPrompt.trim()}
                          className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Envoyer
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <div className="text-xs text-gray-400 text-center">
                          Propulsé par notre IA avancée
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-300 hover:text-red-200 hover:bg-red-900/20 p-1 h-auto"
                          onClick={() => {
                            setMiniGameChatHistory([]);
                            toast({
                              title: "Conversation réinitialisée",
                              description: "L'historique a été effacé"
                            });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Exercice Interactif */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Monitor className="h-5 w-5 mr-2 text-green-400" />
                      Exercice Pratique
                    </h3>
                    
                    <Badge className="bg-green-600/70">
                      <Target className="h-3 w-3 mr-1" />
                      PRATIQUE
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-blue-300 mb-3">
                    Testez vos connaissances avec cet exercice de sécurité des mots de passe.
                  </p>
                  
                  <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md mb-3">
                    <h4 className="text-sm font-medium text-white mb-2">Évaluateur de Force de Mot de Passe</h4>
                    <p className="text-xs text-blue-200 mb-3">
                      Entrez un mot de passe pour tester sa robustesse contre les attaques.
                    </p>
                    
                    <div className="space-y-3">
                      <Input 
                        type="password"
                        placeholder="Entrez un mot de passe" 
                        className="bg-blue-900/40 border-blue-700 text-white"
                        onChange={(e) => {
                          const result = evaluatePasswordStrength(e.target.value);
                          setExerciseData({
                            ...exerciseData,
                            passwordStrength: result.strength,
                            passwordFeedback: result.feedback
                          });
                          
                          // Ajouter des points si l'utilisateur crée un mot de passe fort
                          if (result.strength === "fort" && !completedInteractions.includes('password-exercise')) {
                            setUserPoints(prev => prev + 15);
                            setCompletedInteractions(prev => [...prev, 'password-exercise']);
                          }
                        }}
                      />
                      
                      {exerciseData.passwordStrength && (
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                exerciseData.passwordStrength === "fort" ? "bg-green-500" : 
                                exerciseData.passwordStrength === "moyen" ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`}
                              style={{ 
                                width: exerciseData.passwordStrength === "fort" ? "100%" : 
                                      exerciseData.passwordStrength === "moyen" ? "50%" : "25%" 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium capitalize" 
                            style={{ 
                              color: exerciseData.passwordStrength === "fort" ? "#10b981" : 
                                    exerciseData.passwordStrength === "moyen" ? "#f59e0b" : "#ef4444"
                            }}>
                            {exerciseData.passwordStrength}
                          </span>
                        </div>
                      )}
                      
                      {exerciseData.passwordFeedback && (
                        <p className="text-xs p-2 rounded" style={{ 
                          backgroundColor: exerciseData.passwordStrength === "fort" ? "rgba(16, 185, 129, 0.1)" : 
                                        exerciseData.passwordStrength === "moyen" ? "rgba(245, 158, 11, 0.1)" : 
                                        "rgba(239, 68, 68, 0.1)",
                          color: exerciseData.passwordStrength === "fort" ? "#10b981" : 
                                exerciseData.passwordStrength === "moyen" ? "#f59e0b" : "#ef4444"
                        }}>
                          {exerciseData.passwordFeedback}
                        </p>
                      )}
                      
                      {exerciseData.passwordStrength === "fort" && !completedInteractions.includes('password-exercise') && (
                        <div className="mt-2 pt-2 border-t border-blue-700/30 flex items-center">
                          <Award className="h-4 w-4 text-amber-400 mr-1" />
                          <span className="text-xs text-amber-300">+15 points pour avoir créé un mot de passe fort!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ressources complémentaires */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                      Ressources
                    </h3>
                    
                    <div className="flex items-center text-xs text-amber-300">
                      <Trophy className="h-4 w-4 mr-1 text-amber-400" />
                      <span>{userPoints} points</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => window.open("https://cyber.gouv.fr/publications/guide-dhygiene-informatique", "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span className="text-sm">Guide des bonnes pratiques ANSSI</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => window.open("https://www.intercert-france.fr/publications/fiches-reflexes/", "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span className="text-sm">Les fiches réflexes d'InterCERT France</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => {
                        if (!completedInteractions.includes('resource-click')) {
                          setUserPoints(prev => prev + 5);
                          setCompletedInteractions(prev => [...prev, 'resource-click']);
                        }
                        // Rediriger vers le PDF de l'ANSSI
                        window.open("https://cyber.gouv.fr/sites/default/files/document/livret-1-former-a-la-cybersecurite.pdf", "_blank");
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="text-sm text-center">Se former à la cybersécurité PDF</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}