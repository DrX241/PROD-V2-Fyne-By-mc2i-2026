import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Brain, User, Mail, Phone, QrCode, MessageSquare, 
  Users, ListChecks, FileText, AlertCircle, CheckCircle, HelpCircle, 
  BarChart, FolderLock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from "@/components/ui/separator";

// Types
interface Target {
  id: string;
  name: string;
  role: string;
  department: string;
  icon: React.ReactNode;
  traits: string[];
  vulnerabilities: string[];
  description: string;
  expertise: number;
  profilePicture?: string;
}

interface AttackVector {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  effectiveness: number;
  urgency: number;
  credibility: number;
  examples: string[];
}

interface SocialEngScenario {
  id: string;
  title: string;
  description: string;
  targetId: string;
  vectorId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  objectives: string[];
  completed: boolean;
}

interface SimulationMessage {
  sender: 'player' | 'target' | 'system';
  content: string;
  timestamp: string;
}

export default function BrainHacker() {
  // États du jeu
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedVector, setSelectedVector] = useState<string | null>(null);
  const [playerMessage, setPlayerMessage] = useState<string>("");
  const [simulationMessages, setSimulationMessages] = useState<SimulationMessage[]>([]);
  const [currentScenario, setCurrentScenario] = useState<SocialEngScenario | null>(null);
  const [messageIntentions, setMessageIntentions] = useState({
    urgency: 50,
    credibility: 50,
    emotionalAppeal: 50,
    informationRequest: 50,
    confidentiality: 50
  });
  const [gamePhase, setGamePhase] = useState<'planning' | 'execution' | 'analysis'>('planning');
  const [gameResult, setGameResult] = useState<{
    success: boolean;
    score: number;
    feedback: string;
    vulnerabilityExploited?: string;
    improvement?: string;
  } | null>(null);

  // Données des cibles potentielles
  const targets: Target[] = [
    {
      id: 'hr-manager',
      name: 'Sophie Laurent',
      role: 'Responsable RH',
      department: 'Ressources Humaines',
      icon: <Users className="h-5 w-5 text-pink-400" />,
      traits: ['Empathique', 'Organisée', 'Communicative'],
      vulnerabilities: ['Forte volonté d\'aider', 'Accès aux données personnelles', 'Confiance dans les demandes internes'],
      description: 'Sophie gère toutes les données des employés et est responsable du recrutement. Elle reçoit de nombreuses demandes quotidiennes et cherche à répondre rapidement aux besoins des équipes.',
      expertise: 3,
      profilePicture: '/hr-profile.jpg'
    },
    {
      id: 'it-admin',
      name: 'Thomas Dubois',
      role: 'Administrateur système',
      department: 'IT',
      icon: <FolderLock className="h-5 w-5 text-blue-400" />,
      traits: ['Méthodique', 'Vigilant', 'Technique'],
      vulnerabilities: ['Surchargé de travail', 'Habitué aux demandes urgentes', 'Pressions de la direction'],
      description: 'Thomas est responsable de la maintenance des systèmes et de la résolution des problèmes techniques. Il reçoit souvent des demandes urgentes de tous les services.',
      expertise: 8,
      profilePicture: '/it-profile.jpg'
    },
    {
      id: 'finance-director',
      name: 'Pierre Moreau',
      role: 'Directeur financier',
      department: 'Finance',
      icon: <BarChart className="h-5 w-5 text-green-400" />,
      traits: ['Analytique', 'Précis', 'Autoritaire'],
      vulnerabilities: ['Pression des deadlines', 'Respect de la hiérarchie', 'Crainte des erreurs financières'],
      description: 'Pierre supervise toutes les opérations financières et a accès aux comptes bancaires de l\'entreprise. Il est particulièrement attentif aux demandes venant de la direction.',
      expertise: 5,
      profilePicture: '/finance-profile.jpg'
    },
    {
      id: 'developer',
      name: 'Julie Martin',
      role: 'Développeuse frontend',
      department: 'Tech',
      icon: <FileText className="h-5 w-5 text-purple-400" />,
      traits: ['Créative', 'Concentrée', 'Collaborative'],
      vulnerabilities: ['Partage de code', 'Accès aux dépôts', 'Trop confiante dans les liens techniques'],
      description: 'Julie travaille sur plusieurs projets en parallèle et utilise de nombreux outils et référentiels. Elle recherche régulièrement des solutions techniques en ligne.',
      expertise: 6,
      profilePicture: '/dev-profile.jpg'
    },
    {
      id: 'ceo-assistant',
      name: 'Marc Leroy',
      role: 'Assistant de direction',
      department: 'Direction',
      icon: <ListChecks className="h-5 w-5 text-amber-400" />,
      traits: ['Efficace', 'Loyal', 'Discret'],
      vulnerabilities: ['Désir de satisfaire la direction', 'Accès à des informations sensibles', 'Nombreuses sollicitations externes'],
      description: 'Marc gère l\'agenda du PDG et a accès à de nombreuses informations confidentielles. Il est le point de contact privilégié pour toutes les demandes destinées à la direction.',
      expertise: 4,
      profilePicture: '/assistant-profile.jpg'
    }
  ];

  // Vecteurs d'attaque disponibles
  const attackVectors: AttackVector[] = [
    {
      id: 'email',
      name: 'Email de phishing',
      icon: <Mail className="h-5 w-5 text-blue-400" />,
      description: 'Créez un email convaincant pour obtenir des informations ou des actions de la part de la cible.',
      effectiveness: 7,
      urgency: 6,
      credibility: 8,
      examples: [
        'Email semblant provenir d\'un collègue',
        'Alerte de sécurité urgente',
        'Demande de validation d\'informations'
      ]
    },
    {
      id: 'phone',
      name: 'Appel téléphonique',
      icon: <Phone className="h-5 w-5 text-green-400" />,
      description: 'Utilisez la persuasion vocale pour manipuler la cible et obtenir des informations confidentielles.',
      effectiveness: 8,
      urgency: 9,
      credibility: 7,
      examples: [
        'Appel du support technique',
        'Urgence à résoudre',
        'Vérification d\'identité'
      ]
    },
    {
      id: 'sms',
      name: 'SMS frauduleux',
      icon: <MessageSquare className="h-5 w-5 text-purple-400" />,
      description: 'Envoyez un message court avec un appel à l\'action immédiat, souvent avec un lien.',
      effectiveness: 6,
      urgency: 8,
      credibility: 5,
      examples: [
        'Alerte de sécurité bancaire',
        'Notification de colis',
        'Code de vérification urgent'
      ]
    },
    {
      id: 'qrcode',
      name: 'QR Code malveillant',
      icon: <QrCode className="h-5 w-5 text-red-400" />,
      description: 'Créez un QR code qui dirige la victime vers un site de phishing ou exécute une action malveillante.',
      effectiveness: 5,
      urgency: 4,
      credibility: 6,
      examples: [
        'Accès Wi-Fi entreprise',
        'Menu digital avec réduction',
        'Formulaire de satisfaction'
      ]
    }
  ];

  // Scénarios prédéfinis
  const scenarios: SocialEngScenario[] = [
    {
      id: 'scenario1',
      title: 'Récupération d\'identifiants VPN',
      description: 'Obtenez les identifiants VPN de l\'entreprise pour accéder au réseau interne',
      targetId: 'it-admin',
      vectorId: 'email',
      difficulty: 'medium',
      objectives: [
        'Créer un prétexte crédible',
        'Donner une raison d\'urgence',
        'Obtenir les identifiants sans éveiller de soupçons'
      ],
      completed: false
    },
    {
      id: 'scenario2',
      title: 'Transfert bancaire frauduleux',
      description: 'Convaincre le directeur financier d\'effectuer un virement vers un compte externe',
      targetId: 'finance-director',
      vectorId: 'phone',
      difficulty: 'hard',
      objectives: [
        'Se faire passer pour un dirigeant',
        'Créer un sentiment d\'urgence extrême',
        'Contourner les procédures de vérification'
      ],
      completed: false
    },
    {
      id: 'scenario3',
      title: 'Accès aux dossiers des employés',
      description: 'Obtenir l\'accès aux dossiers confidentiels des employés',
      targetId: 'hr-manager',
      vectorId: 'email',
      difficulty: 'easy',
      objectives: [
        'Créer une fausse identité crédible',
        'Justifier la demande d\'accès',
        'Éviter les procédures de vérification standard'
      ],
      completed: false
    }
  ];

  // Fonction pour obtenir la date/heure formatée
  const getFormattedTimestamp = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Gestion du changement de cible
  const handleTargetChange = (targetId: string) => {
    setSelectedTarget(targetId);
  };

  // Gestion du changement de vecteur d'attaque
  const handleVectorChange = (vectorId: string) => {
    setSelectedVector(vectorId);
  };

  // Sélection d'un scénario prédéfini
  const selectScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      setSelectedTarget(scenario.targetId);
      setSelectedVector(scenario.vectorId);
      // Réinitialiser les messages et les résultats précédents
      setSimulationMessages([]);
      setGameResult(null);
      setGamePhase('planning');
    }
  };

  // Commencer une partie personnalisée
  const startCustomGame = () => {
    if (!selectedTarget || !selectedVector) return;

    // Créer un scénario personnalisé
    const customScenario: SocialEngScenario = {
      id: `custom-${Date.now()}`,
      title: 'Attaque personnalisée',
      description: 'Scénario d\'ingénierie sociale créé sur mesure',
      targetId: selectedTarget,
      vectorId: selectedVector,
      difficulty: 'medium',
      objectives: [
        'Obtenir des informations sensibles',
        'Convaincre la cible d\'effectuer une action',
        'Éviter d\'éveiller les soupçons'
      ],
      completed: false
    };

    setCurrentScenario(customScenario);
    setSimulationMessages([]);
    setGameResult(null);
    setGamePhase('planning');
    setActiveTab('play');
  };

  // Commencer l'exécution de l'attaque
  const startAttackExecution = () => {
    if (!currentScenario) return;

    const target = targets.find(t => t.id === currentScenario.targetId);
    const vector = attackVectors.find(v => v.id === currentScenario.vectorId);

    if (!target || !vector) return;

    setGamePhase('execution');
    
    // Message initial du système
    setSimulationMessages([
      {
        sender: 'system',
        content: `Simulation démarrée. Vous allez tenter d'obtenir des informations de ${target.name} (${target.role}) en utilisant un ${vector.name}.`,
        timestamp: getFormattedTimestamp()
      }
    ]);
  };

  // Envoyer un message dans la simulation en utilisant l'API
  const sendMessage = async () => {
    if (!playerMessage.trim() || !currentScenario) return;
    
    const target = targets.find(t => t.id === currentScenario.targetId);
    const vector = attackVectors.find(v => v.id === currentScenario.vectorId);
    if (!target || !vector) return;

    // Ajouter le message du joueur
    const newMessage: SimulationMessage = {
      sender: 'player',
      content: playerMessage,
      timestamp: getFormattedTimestamp()
    };

    const updatedMessages = [...simulationMessages, newMessage];
    setSimulationMessages(updatedMessages);
    setPlayerMessage('');
    
    // Afficher un indicateur de chargement
    setSimulationMessages(prev => [...prev, {
      sender: 'system',
      content: 'En attente de réponse...',
      timestamp: getFormattedTimestamp()
    }]);
    
    try {
      // Préparation des données pour l'API
      const requestData = {
        message: playerMessage,
        target: {
          id: target.id,
          name: target.name,
          role: target.role,
          department: target.department,
          traits: target.traits,
          vulnerabilities: target.vulnerabilities,
          description: target.description,
          expertise: target.expertise
        },
        intentions: messageIntentions,
        attackVector: {
          id: vector.id,
          name: vector.name,
          description: vector.description,
          effectiveness: vector.effectiveness
        },
        scenario: {
          title: currentScenario.title,
          description: currentScenario.description,
          objectives: currentScenario.objectives
        },
        conversationHistory: simulationMessages.map(msg => ({
          sender: msg.sender,
          content: msg.content
        }))
      };
      
      // Appel à l'API
      const response = await fetch('/api/cyber/arcade/brain-hacker/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const targetResponse = await response.json();
      
      // Retirer le message d'attente
      setSimulationMessages(prev => prev.filter(msg => msg.content !== 'En attente de réponse...'));
      
      // Ajouter la réponse de la cible
      setSimulationMessages(prev => [...prev, {
        sender: 'target',
        content: targetResponse.message,
        timestamp: getFormattedTimestamp()
      }]);

      // Si la tentative a réussi ou échoué définitivement, terminer le jeu
      if (targetResponse.analysis.success || targetResponse.analysis.criticalFailure) {
        endGame(
          targetResponse.analysis.success, 
          {
            success: targetResponse.analysis.success,
            criticalFailure: targetResponse.analysis.criticalFailure,
            exploitedVulnerability: targetResponse.analysis.vulnerabilityExploited,
            score: targetResponse.analysis.score,
            feedback: targetResponse.analysis.feedback
          }
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API:', error);
      
      // Retirer le message d'attente
      setSimulationMessages(prev => prev.filter(msg => msg.content !== 'En attente de réponse...'));
      
      // Afficher un message d'erreur
      setSimulationMessages(prev => [...prev, {
        sender: 'system',
        content: 'Une erreur est survenue lors de la communication avec la cible.',
        timestamp: getFormattedTimestamp()
      }]);
    }
  };

  // Simuler la réponse de la cible (IA simple)
  const simulateTargetResponse = (
    message: string, 
    target: Target, 
    intentions: typeof messageIntentions
  ): {
    message: string;
    success: boolean;
    criticalFailure: boolean;
    exploitedVulnerability?: string;
    score?: number;
  } => {
    // Texte en minuscules pour faciliter la recherche de mots-clés
    const lowerMsg = message.toLowerCase();
    
    // Indices de suspicion
    let suspicionLevel = 0;
    let success = false;
    let criticalFailure = false;
    let exploitedVulnerability = '';
    
    // Mots qui augmentent la suspicion
    const suspiciousTerms = ['urgent', 'immédiatement', 'confidentiel', 'problème', 'sécurité', 
                             'compte bloqué', 'violation', 'vérifier', 'identifiants'];
    
    // Personnalité de la cible
    const isHelpful = target.traits.includes('Empathique') || target.traits.includes('Communicative');
    const isCautious = target.traits.includes('Vigilant') || target.traits.includes('Méthodique');
    
    // Vulnérabilités exploitables
    const pressureVulnerable = target.vulnerabilities.some(v => 
      v.includes('urgence') || v.includes('pression') || v.includes('deadlines'));
    
    const authorityVulnerable = target.vulnerabilities.some(v => 
      v.includes('hiérarchie') || v.includes('direction') || v.includes('satisfaire'));
    
    const trustVulnerable = target.vulnerabilities.some(v => 
      v.includes('confiance') || v.includes('aider'));
    
    // Analyse des facteurs de suspicion
    // 1. Niveau d'urgence trop élevé par rapport à l'expertise
    if (intentions.urgency > 70 && target.expertise > 5) {
      suspicionLevel += 2;
    }
    
    // 2. Présence de termes suspects
    suspiciousTerms.forEach(term => {
      if (lowerMsg.includes(term)) suspicionLevel += 1;
    });
    
    // 3. Longueur du message (les messages trop courts sont suspects)
    if (message.length < 50) {
      suspicionLevel += 1;
    }
    
    // 4. Exploitation de vulnérabilités
    let vulnerabilityExploited = false;
    
    // Vulnérabilité à la pression/urgence
    if (pressureVulnerable && intentions.urgency > 60) {
      suspicionLevel -= 2;
      vulnerabilityExploited = true;
      exploitedVulnerability = 'Pression temporelle';
    }
    
    // Vulnérabilité à l'autorité
    if (authorityVulnerable && 
        (lowerMsg.includes('directeur') || lowerMsg.includes('chef') || 
         lowerMsg.includes('responsable') || lowerMsg.includes('direction'))) {
      suspicionLevel -= 2;
      vulnerabilityExploited = true;
      exploitedVulnerability = 'Respect de la hiérarchie';
    }
    
    // Vulnérabilité à la confiance/aide
    if (trustVulnerable && 
        (lowerMsg.includes('aide') || lowerMsg.includes('besoin') || 
         lowerMsg.includes('service') || lowerMsg.includes('merci'))) {
      suspicionLevel -= 2;
      vulnerabilityExploited = true;
      exploitedVulnerability = 'Volonté d\'aider';
    }
    
    // 5. Crédibilité technique
    if (target.department === 'IT' && intentions.credibility < 60) {
      suspicionLevel += 3; // Les experts IT sont plus sensibles au manque de crédibilité technique
    }
    
    // Ajuster en fonction de l'expertise de la cible
    suspicionLevel = suspicionLevel - (9 - target.expertise) / 3;
    
    // Déterminer le résultat
    let response = '';
    
    if (suspicionLevel <= -3) {
      // Grand succès - La cible est complètement manipulée
      success = true;
      response = `Bien sûr, je comprends l'urgence. Voici les informations que vous demandez : [INFORMATIONS SENSIBLES]. N'hésitez pas si vous avez besoin d'autre chose.`;
    } 
    else if (suspicionLevel <= 0) {
      // Succès partiel - La cible hésite mais coopère
      success = true;
      response = `Ce n'est pas la procédure habituelle, mais je comprends la situation. Voici ce que vous demandez : [INFORMATIONS SENSIBLES]. À l'avenir, merci de suivre le processus standard.`;
    }
    else if (suspicionLevel <= 3) {
      // Échec léger - La cible est méfiante mais pas hostile
      response = `Je ne peux pas vous fournir ces informations immédiatement. Pouvez-vous me donner plus de détails ou passer par les canaux officiels?`;
    }
    else {
      // Échec critique - La cible a détecté la tentative
      criticalFailure = true;
      response = `Je suis désolé, mais cette demande me semble très suspecte. Je vais devoir la signaler à notre équipe de sécurité. Merci de ne plus me contacter à ce sujet.`;
    }
    
    // Calculer le score (0-100)
    const baseScore = success ? 70 : 30;
    const vulnerabilityBonus = vulnerabilityExploited ? 20 : 0;
    const suspicionPenalty = Math.max(0, suspicionLevel * 10);
    
    const score = Math.min(100, Math.max(0, baseScore + vulnerabilityBonus - suspicionPenalty));
    
    return {
      message: response,
      success,
      criticalFailure,
      exploitedVulnerability: vulnerabilityExploited ? exploitedVulnerability : undefined,
      score
    };
  };

  // Demander une analyse complète de la performance à l'API
  const requestPerformanceAnalysis = async () => {
    if (!currentScenario) return null;
    
    const target = targets.find(t => t.id === currentScenario.targetId);
    if (!target) return null;
    
    try {
      // Préparation des données pour l'API
      const requestData = {
        conversationHistory: simulationMessages.map(msg => ({
          sender: msg.sender,
          content: msg.content
        })),
        target: {
          id: target.id,
          name: target.name,
          role: target.role,
          traits: target.traits,
          vulnerabilities: target.vulnerabilities,
          description: target.description
        },
        scenario: {
          title: currentScenario.title,
          description: currentScenario.description,
          objectives: currentScenario.objectives
        }
      };
      
      // Appel à l'API
      const response = await fetch('/api/cyber/arcade/brain-hacker/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'analyse de performance:', error);
      return null;
    }
  };

  // Terminer le jeu et afficher les résultats
  const endGame = async (success: boolean, results: any) => {
    setGamePhase('analysis');
    
    const score = results.score || (success ? 85 : 35);
    
    // Ajouter un message système avec les résultats immédiats
    setSimulationMessages(prev => [...prev, {
      sender: 'system',
      content: `Simulation terminée. ${success ? 'Attaque réussie!' : 'Attaque échouée.'} Score initial: ${score}/100`,
      timestamp: getFormattedTimestamp()
    }]);
    
    // Message d'attente pour l'analyse détaillée
    setSimulationMessages(prev => [...prev, {
      sender: 'system',
      content: 'Analyse détaillée de votre technique en cours...',
      timestamp: getFormattedTimestamp()
    }]);
    
    // Obtenir l'analyse détaillée de l'API
    const detailedAnalysis = await requestPerformanceAnalysis();
    
    // Supprimer le message d'attente
    setSimulationMessages(prev => 
      prev.filter(msg => msg.content !== 'Analyse détaillée de votre technique en cours...')
    );
    
    if (detailedAnalysis) {
      // Ajouter un message système avec l'analyse détaillée
      setSimulationMessages(prev => [...prev, {
        sender: 'system',
        content: `📊 Analyse détaillée - Score final: ${detailedAnalysis.score}/100\n\n${detailedAnalysis.evaluation}`,
        timestamp: getFormattedTimestamp()
      }]);
      
      // Mettre à jour les résultats du jeu
      setGameResult({
        success,
        score: detailedAnalysis.score,
        feedback: detailedAnalysis.evaluation,
        techniques: detailedAnalysis.techniques,
        strengths: detailedAnalysis.strengths,
        weaknesses: detailedAnalysis.weaknesses,
        recommendations: detailedAnalysis.recommendations,
        vulnerabilityExploited: results.exploitedVulnerability
      });
    } else {
      // Fallback si l'analyse détaillée échoue
      let feedback = '';
      let improvement = '';
      
      if (success) {
        if (score > 90) {
          feedback = "Excellente manipulation! Vous avez parfaitement exploité les vulnérabilités psychologiques de la cible.";
        } else {
          feedback = "Attaque réussie. Vous avez obtenu les informations, mais certains aspects auraient pu être améliorés.";
        }
        
        improvement = "Pour améliorer encore votre score, travaillez sur la crédibilité technique et évitez les termes trop suspects.";
      } else {
        if (score < 20) {
          feedback = "Échec critique. Votre tentative était beaucoup trop évidente et a immédiatement éveillé les soupçons.";
        } else {
          feedback = "Tentative échouée. La cible est restée méfiante et n'a pas fourni les informations demandées.";
        }
        
        if (results.exploitedVulnerability) {
          improvement = `Vous avez bien identifié une vulnérabilité (${results.exploitedVulnerability}), mais d'autres aspects ont éveillé les soupçons.`;
        } else {
          improvement = "Essayez d'identifier et d'exploiter les vulnérabilités spécifiques de la cible, comme sa volonté d'aider ou son respect de l'autorité.";
        }
      }
      
      setGameResult({
        success,
        score,
        feedback,
        vulnerabilityExploited: results.exploitedVulnerability,
        improvement
      });
      
      // Message d'erreur concernant l'analyse détaillée
      setSimulationMessages(prev => [...prev, {
        sender: 'system',
        content: 'L\'analyse détaillée n\'a pas pu être générée. Voici une évaluation simplifiée.',
        timestamp: getFormattedTimestamp()
      }]);
    }
  };

  // Réinitialiser le jeu
  const resetGame = () => {
    setCurrentScenario(null);
    setSimulationMessages([]);
    setGameResult(null);
    setGamePhase('planning');
    setSelectedTarget(null);
    setSelectedVector(null);
    setPlayerMessage('');
    setActiveTab('overview');
  };

  // Formater les intentions pour l'affichage
  const getIntentionLabel = (value: number): string => {
    if (value < 30) return "Faible";
    if (value < 70) return "Moyen";
    return "Élevé";
  };

  return (
    <HomeLayout>
      <PageTitle title="BrainHacker - Ingénierie sociale inversée" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        {/* Contenu principal */}
        <div className="container mx-auto p-4 relative z-10">
          {/* En-tête */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start">
            <div>
              <Link href="/cyber/arcade">
                <Button variant="ghost" className="text-purple-300 hover:text-purple-100 p-0 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Cyber Arcade
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                <Brain className="mr-2 h-8 w-8 text-purple-400" />
                BrainHacker
              </h1>
              <p className="text-purple-200 max-w-3xl">
                Mettez-vous dans la peau d'un pirate utilisant l'ingénierie sociale. Choisissez votre cible, votre mode d'attaque,
                et tentez d'obtenir des informations confidentielles en manipulant les faiblesses psychologiques.
              </p>
            </div>
          </div>

          {/* Onglets principaux */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-purple-500/20">
                <TabsList className="bg-transparent border-b border-purple-500/20 rounded-none w-full justify-start h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-purple-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Présentation
                  </TabsTrigger>
                  <TabsTrigger
                    value="targets"
                    className="data-[state=active]:bg-purple-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Cibles
                  </TabsTrigger>
                  <TabsTrigger
                    value="vectors"
                    className="data-[state=active]:bg-purple-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Vecteurs
                  </TabsTrigger>
                  <TabsTrigger
                    value="scenarios"
                    className="data-[state=active]:bg-purple-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Scénarios
                  </TabsTrigger>
                  <TabsTrigger
                    value="play"
                    className="data-[state=active]:bg-purple-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                    disabled={!currentScenario && !selectedTarget}
                  >
                    Jouer
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Onglet Présentation */}
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-purple-950/40 border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Brain className="mr-2 h-5 w-5 text-purple-400" />
                          Concept du jeu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-purple-100">
                        <p className="mb-4">
                          Dans BrainHacker, vous prenez le rôle d'un pirate informatique spécialisé en ingénierie sociale.
                          Votre mission est d'obtenir des informations confidentielles ou d'inciter vos cibles à effectuer
                          des actions comprommettantes en exploitant leurs vulnérabilités psychologiques plutôt que des failles techniques.
                        </p>
                        <p>
                          Cette simulation vous apprendra à comprendre les mécanismes psychologiques utilisés dans 
                          les attaques d'ingénierie sociale, vous aidant ainsi à mieux vous en protéger dans la vie réelle.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-950/40 border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <ListChecks className="mr-2 h-5 w-5 text-purple-400" />
                          Fonctionnement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-purple-100">
                        <div className="flex">
                          <div className="bg-purple-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-purple-200">1</div>
                          <p>Choisissez une cible et analysez ses vulnérabilités psychologiques</p>
                        </div>
                        <div className="flex">
                          <div className="bg-purple-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-purple-200">2</div>
                          <p>Sélectionnez un vecteur d'attaque (email, appel téléphonique, SMS...)</p>
                        </div>
                        <div className="flex">
                          <div className="bg-purple-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-purple-200">3</div>
                          <p>Créez votre message en exploitant les faiblesses identifiées</p>
                        </div>
                        <div className="flex">
                          <div className="bg-purple-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-purple-200">4</div>
                          <p>Observez la réaction de l'IA et adaptez votre approche</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-purple-950/40 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-purple-400" />
                        Objectifs d'apprentissage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-purple-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-purple-300 mb-2">Mécanismes psychologiques</h3>
                          <p className="text-purple-100 text-sm">
                            Comprendre les leviers utilisés par les attaquants: urgence, autorité, peur, curiosité...
                          </p>
                        </div>
                        <div className="bg-purple-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-purple-300 mb-2">Profils vulnérables</h3>
                          <p className="text-purple-100 text-sm">
                            Identifier quels types de personnalité sont plus vulnérables à certaines techniques de manipulation.
                          </p>
                        </div>
                        <div className="bg-purple-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-purple-300 mb-2">Protection personnelle</h3>
                          <p className="text-purple-100 text-sm">
                            Développer des réflexes de défense en comprenant comment fonctionnent ces attaques de l'intérieur.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-purple-200 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Rappel : Ces compétences sont enseignées uniquement à des fins de sensibilisation et de protection.
                      </p>
                    </CardFooter>
                  </Card>

                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setActiveTab("targets")} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Commencer l'aventure
                    </Button>
                  </div>
                </TabsContent>

                {/* Onglet Cibles */}
                <TabsContent value="targets" className="m-0">
                  <h2 className="text-xl font-bold text-white mb-4">Choisissez votre cible</h2>
                  <p className="text-purple-200 mb-6">
                    Chaque cible a des vulnérabilités psychologiques différentes. Analysez leur profil pour identifier
                    les leviers de manipulation les plus efficaces.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {targets.map((target) => (
                      <Card 
                        key={target.id}
                        className={`bg-slate-900/60 border transition-all duration-300 hover:shadow-md ${
                          selectedTarget === target.id 
                            ? 'border-purple-400 shadow-purple-500/30' 
                            : 'border-purple-500/20'
                        }`}
                        onClick={() => handleTargetChange(target.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-purple-900 text-white">
                                  {target.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg text-white">{target.name}</CardTitle>
                                <CardDescription className="text-purple-300">
                                  {target.role}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-purple-900/30 border-purple-400/30 text-purple-300">
                              {target.department}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-purple-300 mb-1">Traits de caractère</h4>
                              <div className="flex flex-wrap gap-1">
                                {target.traits.map(trait => (
                                  <Badge key={trait} variant="secondary" className="bg-purple-950/50 text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-purple-300 mb-1">Vulnérabilités potentielles</h4>
                              <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                                {target.vulnerabilities.map(vuln => (
                                  <li key={vuln}>{vuln}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-purple-300 mb-1">Expertise en sécurité</h4>
                              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-500 h-full rounded-full"
                                  style={{ width: `${target.expertise * 10}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-purple-300 mt-1">
                                <span>Novice</span>
                                <span>Expert</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-purple-500/20 pt-4">
                          <Button
                            variant="ghost"
                            className={`w-full bg-purple-900/30 text-purple-200 hover:bg-purple-800/40 ${
                              selectedTarget === target.id ? 'bg-purple-700/40' : ''
                            }`}
                            onClick={() => handleTargetChange(target.id)}
                          >
                            {selectedTarget === target.id ? 'Cible sélectionnée' : 'Sélectionner cette cible'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      className="border-purple-500/20 text-purple-300"
                      onClick={() => setActiveTab("overview")}
                    >
                      Retour
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setActiveTab("vectors")}
                      disabled={!selectedTarget}
                    >
                      Choisir un vecteur d'attaque
                    </Button>
                  </div>
                </TabsContent>

                {/* Onglet Vecteurs d'attaque */}
                <TabsContent value="vectors" className="m-0">
                  <h2 className="text-xl font-bold text-white mb-4">Choisissez votre vecteur d'attaque</h2>
                  <p className="text-purple-200 mb-6">
                    Le vecteur d'attaque détermine comment vous allez approcher votre cible. Chaque méthode a ses avantages
                    et ses inconvénients selon le profil de la cible.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {attackVectors.map((vector) => (
                      <Card 
                        key={vector.id}
                        className={`bg-slate-900/60 border transition-all duration-300 hover:shadow-md ${
                          selectedVector === vector.id 
                            ? 'border-purple-400 shadow-purple-500/30' 
                            : 'border-purple-500/20'
                        }`}
                        onClick={() => handleVectorChange(vector.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            <div className="bg-purple-900/70 p-2 rounded-lg mr-3">
                              {vector.icon}
                            </div>
                            <CardTitle className="text-lg text-white">{vector.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-purple-200 mb-4 text-sm">{vector.description}</p>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-purple-300">Efficacité</span>
                                <span className="text-purple-200">{vector.effectiveness}/10</span>
                              </div>
                              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-purple-500 h-full rounded-full"
                                  style={{ width: `${vector.effectiveness * 10}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-purple-300">Effet d'urgence</span>
                                <span className="text-purple-200">{vector.urgency}/10</span>
                              </div>
                              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${vector.urgency * 10}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-purple-300">Crédibilité potentielle</span>
                                <span className="text-purple-200">{vector.credibility}/10</span>
                              </div>
                              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-green-500 h-full rounded-full"
                                  style={{ width: `${vector.credibility * 10}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-purple-300 mb-1">Exemples d'utilisation</h4>
                            <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                              {vector.examples.map((example, index) => (
                                <li key={index}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-purple-500/20 pt-4">
                          <Button
                            variant="ghost"
                            className={`w-full bg-purple-900/30 text-purple-200 hover:bg-purple-800/40 ${
                              selectedVector === vector.id ? 'bg-purple-700/40' : ''
                            }`}
                            onClick={() => handleVectorChange(vector.id)}
                          >
                            {selectedVector === vector.id ? 'Vecteur sélectionné' : 'Sélectionner ce vecteur'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      className="border-purple-500/20 text-purple-300"
                      onClick={() => setActiveTab("targets")}
                    >
                      Retour aux cibles
                    </Button>
                    
                    <div className="space-x-3">
                      <Button 
                        variant="outline" 
                        className="border-purple-500/20 text-purple-300"
                        onClick={() => setActiveTab("scenarios")}
                      >
                        Voir les scénarios
                      </Button>
                      
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={startCustomGame}
                        disabled={!selectedTarget || !selectedVector}
                      >
                        Commencer une partie personnalisée
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Scénarios */}
                <TabsContent value="scenarios" className="m-0">
                  <h2 className="text-xl font-bold text-white mb-4">Scénarios prédéfinis</h2>
                  <p className="text-purple-200 mb-6">
                    Choisissez parmi ces scénarios pour vous entraîner avec des objectifs spécifiques et des cibles
                    prédéterminées.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map((scenario) => {
                      const target = targets.find(t => t.id === scenario.targetId);
                      const vector = attackVectors.find(v => v.id === scenario.vectorId);
                      
                      return (
                        <Card 
                          key={scenario.id}
                          className="bg-slate-900/60 border border-purple-500/20 transition-all duration-300 hover:shadow-md hover:border-purple-500/40"
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-white">{scenario.title}</CardTitle>
                              <Badge className={
                                scenario.difficulty === 'easy' ? 'bg-green-700/30 text-green-400' :
                                scenario.difficulty === 'medium' ? 'bg-amber-700/30 text-amber-400' :
                                'bg-red-700/30 text-red-400'
                              }>
                                {scenario.difficulty === 'easy' ? 'Facile' : 
                                 scenario.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                              </Badge>
                            </div>
                            <CardDescription className="text-purple-300">
                              {scenario.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-purple-400 mr-2" />
                                <span className="text-sm text-purple-200">Cible: {target?.name} ({target?.role})</span>
                              </div>
                              
                              <div className="flex items-center">
                                {vector?.icon && React.cloneElement(vector.icon as React.ReactElement, { className: "h-4 w-4 text-purple-400 mr-2" })}
                                <span className="text-sm text-purple-200">Vecteur: {vector?.name}</span>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-purple-300 mb-1 flex items-center">
                                  <ListChecks className="h-4 w-4 mr-1" /> Objectifs
                                </h4>
                                <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                                  {scenario.objectives.map((objective, index) => (
                                    <li key={index}>{objective}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-purple-500/20 pt-4">
                            <Button
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => selectScenario(scenario.id)}
                            >
                              Sélectionner ce scénario
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      className="border-purple-500/20 text-purple-300"
                      onClick={() => setActiveTab("vectors")}
                    >
                      Retour aux vecteurs
                    </Button>
                    
                    {currentScenario && (
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setActiveTab("play")}
                      >
                        Jouer le scénario sélectionné
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {/* Onglet Jeu */}
                <TabsContent value="play" className="m-0">
                  {currentScenario && (
                    <div className="space-y-6">
                      {/* En-tête du scénario */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-white">{currentScenario.title}</h2>
                          <p className="text-purple-300">{currentScenario.description}</p>
                        </div>
                        <Badge className={
                          currentScenario.difficulty === 'easy' ? 'bg-green-700/30 text-green-400' :
                          currentScenario.difficulty === 'medium' ? 'bg-amber-700/30 text-amber-400' :
                          'bg-red-700/30 text-red-400'
                        }>
                          {currentScenario.difficulty === 'easy' ? 'Facile' : 
                           currentScenario.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </Badge>
                      </div>
                      
                      {/* Phase de planification */}
                      {gamePhase === 'planning' && (
                        <Card className="bg-slate-900/60 border-purple-500/20">
                          <CardHeader>
                            <CardTitle className="text-white">Planification de l'attaque</CardTitle>
                            <CardDescription className="text-purple-300">
                              Analysez votre cible et préparez votre stratégie avant de lancer l'attaque
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Informations sur la cible */}
                              <div className="space-y-3">
                                <h3 className="text-lg font-medium text-white">Informations sur la cible</h3>
                                {(() => {
                                  const target = targets.find(t => t.id === currentScenario.targetId);
                                  if (!target) return null;
                                  
                                  return (
                                    <div className="bg-purple-950/20 p-4 rounded-lg space-y-3">
                                      <div className="flex items-center">
                                        <Avatar className="h-12 w-12 mr-3">
                                          <AvatarFallback className="bg-purple-900 text-white">
                                            {target.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h4 className="text-white font-medium">{target.name}</h4>
                                          <p className="text-purple-300 text-sm">{target.role} • {target.department}</p>
                                        </div>
                                      </div>
                                      
                                      <p className="text-purple-200 text-sm">{target.description}</p>
                                      
                                      <div>
                                        <h5 className="text-sm font-medium text-purple-300 mb-1">Vulnérabilités potentielles</h5>
                                        <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                                          {target.vulnerabilities.map(vuln => (
                                            <li key={vuln}>{vuln}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                          <span className="text-purple-300">Expertise en sécurité</span>
                                          <span className="text-purple-200">{target.expertise}/10</span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-purple-500 h-full rounded-full"
                                            style={{ width: `${target.expertise * 10}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                              
                              {/* Informations sur le vecteur */}
                              <div className="space-y-3">
                                <h3 className="text-lg font-medium text-white">Vecteur d'attaque</h3>
                                {(() => {
                                  const vector = attackVectors.find(v => v.id === currentScenario.vectorId);
                                  if (!vector) return null;
                                  
                                  return (
                                    <div className="bg-purple-950/20 p-4 rounded-lg space-y-3">
                                      <div className="flex items-center">
                                        <div className="bg-purple-900/70 p-2 rounded-lg mr-3">
                                          {vector.icon}
                                        </div>
                                        <h4 className="text-white font-medium">{vector.name}</h4>
                                      </div>
                                      
                                      <p className="text-purple-200 text-sm">{vector.description}</p>
                                      
                                      <div>
                                        <h5 className="text-sm font-medium text-purple-300 mb-1">Exemples efficaces</h5>
                                        <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                                          {vector.examples.map((example, index) => (
                                            <li key={index}>{example}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <div className="text-center text-xs text-purple-300 mb-1">Efficacité</div>
                                          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                              className="bg-purple-500 h-full rounded-full"
                                              style={{ width: `${vector.effectiveness * 10}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div className="text-center text-xs text-purple-300 mb-1">Urgence</div>
                                          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                              className="bg-amber-500 h-full rounded-full"
                                              style={{ width: `${vector.urgency * 10}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <div className="text-center text-xs text-purple-300 mb-1">Crédibilité</div>
                                          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                              className="bg-green-500 h-full rounded-full"
                                              style={{ width: `${vector.credibility * 10}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium text-white mb-2">Objectifs à atteindre</h3>
                              <div className="bg-purple-950/20 p-4 rounded-lg">
                                <ul className="text-purple-200 space-y-2 pl-0 list-none">
                                  {currentScenario.objectives.map((objective, index) => (
                                    <li key={index} className="flex items-start">
                                      <div className="bg-purple-900/60 rounded-full p-1 mr-3 mt-0.5 h-6 w-6 flex-shrink-0 flex items-center justify-center text-purple-200">
                                        {index + 1}
                                      </div>
                                      {objective}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-medium text-white mb-2">Conseils stratégiques</h3>
                              <Alert className="bg-purple-950/20 border-purple-500/30">
                                <HelpCircle className="h-4 w-4" />
                                <AlertTitle className="text-white">Pour réussir cette attaque</AlertTitle>
                                <AlertDescription className="text-purple-200">
                                  <ul className="pl-4 list-disc mt-2 space-y-1">
                                    <li>Identifiez les vulnérabilités psychologiques de votre cible et exploitez-les</li>
                                    <li>Adaptez votre ton et votre langage au profil de la cible</li>
                                    <li>Établissez votre crédibilité sans éveiller les soupçons</li>
                                    <li>Créez un sentiment d'urgence dosé selon le niveau d'expertise de la cible</li>
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t border-purple-500/20 pt-4 flex justify-between">
                            <Button 
                              variant="outline" 
                              className="border-purple-500/20 text-purple-300"
                              onClick={resetGame}
                            >
                              Annuler
                            </Button>
                            <Button 
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={startAttackExecution}
                            >
                              Lancer l'attaque
                            </Button>
                          </CardFooter>
                        </Card>
                      )}
                      
                      {/* Phase d'exécution ou d'analyse */}
                      {(gamePhase === 'execution' || gamePhase === 'analysis') && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Zone de chat simulé */}
                          <div className="md:col-span-2">
                            <Card className="bg-slate-900/60 border-purple-500/20 h-full flex flex-col">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-white flex items-center">
                                  {(() => {
                                    const vector = attackVectors.find(v => v.id === currentScenario.vectorId);
                                    return (
                                      <>
                                        {vector?.icon}
                                        <span className="ml-2">Simulation de {vector?.name}</span>
                                      </>
                                    );
                                  })()}
                                </CardTitle>
                                <CardDescription className="text-purple-300">
                                  {gamePhase === 'execution' 
                                    ? "Envoyez votre message pour tenter d'obtenir les informations sensibles" 
                                    : "Simulation terminée - Analysez vos résultats"}
                                </CardDescription>
                              </CardHeader>
                              
                              <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
                                <ScrollArea className="flex-grow px-4 py-2">
                                  <div className="space-y-4">
                                    {simulationMessages.map((msg, index) => (
                                      <div key={index} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                                        <div 
                                          className={`max-w-[85%] rounded-lg px-4 py-2 ${
                                            msg.sender === 'player' 
                                              ? 'bg-purple-700/50 text-white' 
                                              : msg.sender === 'target'
                                                ? 'bg-slate-700/50 text-white'
                                                : 'bg-slate-800/80 text-purple-200 italic'
                                          }`}
                                        >
                                          {msg.sender === 'system' && (
                                            <div className="text-xs text-purple-400 mb-1">Système</div>
                                          )}
                                          <p>{msg.content}</p>
                                          <div className="text-xs text-slate-400 mt-1 text-right">
                                            {msg.timestamp}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                                
                                {gamePhase === 'execution' && (
                                  <div className="p-4 border-t border-purple-500/20">
                                    <div className="flex space-x-2">
                                      <Textarea 
                                        placeholder="Tapez votre message ici..."
                                        className="flex-grow bg-slate-800/70 border-purple-500/30 focus:border-purple-400 resize-none text-white"
                                        value={playerMessage}
                                        onChange={e => setPlayerMessage(e.target.value)}
                                        rows={3}
                                      />
                                      <Button 
                                        className="bg-purple-600 hover:bg-purple-700 text-white self-end"
                                        disabled={!playerMessage.trim()}
                                        onClick={sendMessage}
                                      >
                                        Envoyer
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                          
                          {/* Panneau de contrôle et résultats */}
                          <div>
                            <Card className="bg-slate-900/60 border-purple-500/20">
                              <CardHeader>
                                <CardTitle className="text-white">
                                  {gamePhase === 'execution' ? 'Intentions du message' : 'Résultats de l\'attaque'}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {gamePhase === 'execution' && (
                                  <div className="space-y-6">
                                    <div className="space-y-4">
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <label className="text-sm text-purple-300">Niveau d'urgence</label>
                                          <span className="text-sm text-purple-200">{getIntentionLabel(messageIntentions.urgency)}</span>
                                        </div>
                                        <Slider
                                          value={[messageIntentions.urgency]}
                                          onValueChange={(values) => setMessageIntentions({...messageIntentions, urgency: values[0]})}
                                          max={100}
                                          step={1}
                                          className="py-4"
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <label className="text-sm text-purple-300">Crédibilité technique</label>
                                          <span className="text-sm text-purple-200">{getIntentionLabel(messageIntentions.credibility)}</span>
                                        </div>
                                        <Slider
                                          value={[messageIntentions.credibility]}
                                          onValueChange={(values) => setMessageIntentions({...messageIntentions, credibility: values[0]})}
                                          max={100}
                                          step={1}
                                          className="py-4"
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <label className="text-sm text-purple-300">Appel émotionnel</label>
                                          <span className="text-sm text-purple-200">{getIntentionLabel(messageIntentions.emotionalAppeal)}</span>
                                        </div>
                                        <Slider
                                          value={[messageIntentions.emotionalAppeal]}
                                          onValueChange={(values) => setMessageIntentions({...messageIntentions, emotionalAppeal: values[0]})}
                                          max={100}
                                          step={1}
                                          className="py-4"
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <label className="text-sm text-purple-300">Demande d'information</label>
                                          <span className="text-sm text-purple-200">{getIntentionLabel(messageIntentions.informationRequest)}</span>
                                        </div>
                                        <Slider
                                          value={[messageIntentions.informationRequest]}
                                          onValueChange={(values) => setMessageIntentions({...messageIntentions, informationRequest: values[0]})}
                                          max={100}
                                          step={1}
                                          className="py-4"
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between mb-1">
                                          <label className="text-sm text-purple-300">Niveau de confidentialité</label>
                                          <span className="text-sm text-purple-200">{getIntentionLabel(messageIntentions.confidentiality)}</span>
                                        </div>
                                        <Slider
                                          value={[messageIntentions.confidentiality]}
                                          onValueChange={(values) => setMessageIntentions({...messageIntentions, confidentiality: values[0]})}
                                          max={100}
                                          step={1}
                                          className="py-4"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium text-purple-300 mb-2">Conseils</h4>
                                      <div className="bg-purple-950/30 p-3 rounded-lg text-sm text-purple-200">
                                        <p>Ajustez ces curseurs pour qu'ils correspondent à l'intention de votre message. Cela aidera l'IA à simuler une réponse plus réaliste de la cible.</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {gamePhase === 'analysis' && gameResult && (
                                  <div className="space-y-4">
                                    <div className={`p-4 rounded-lg ${
                                      gameResult.success 
                                        ? 'bg-green-900/30 border border-green-500/30' 
                                        : 'bg-red-900/30 border border-red-500/30'
                                    }`}>
                                      <div className="flex items-center mb-2">
                                        {gameResult.success ? (
                                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                        ) : (
                                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                        )}
                                        <h3 className="font-medium text-white">
                                          {gameResult.success ? 'Attaque réussie!' : 'Attaque échouée'}
                                        </h3>
                                      </div>
                                      <p className="text-purple-200 text-sm">{gameResult.feedback}</p>
                                      
                                      <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-purple-300">Score</span>
                                          <span className="text-purple-200">{gameResult.score}/100</span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full rounded-full ${
                                              gameResult.success ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${gameResult.score}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {gameResult.vulnerabilityExploited && (
                                      <div className="p-3 bg-purple-900/20 rounded-lg">
                                        <h4 className="text-sm font-medium text-purple-300 mb-1">Vulnérabilité exploitée</h4>
                                        <p className="text-purple-200 text-sm">{gameResult.vulnerabilityExploited}</p>
                                      </div>
                                    )}
                                    
                                    {gameResult.improvement && (
                                      <div className="p-3 bg-slate-800/60 rounded-lg">
                                        <h4 className="text-sm font-medium text-purple-300 mb-1">Piste d'amélioration</h4>
                                        <p className="text-purple-200 text-sm">{gameResult.improvement}</p>
                                      </div>
                                    )}
                                    
                                    <div className="mt-2">
                                      <h4 className="text-sm font-medium text-purple-300 mb-2">Points clés à retenir</h4>
                                      <ul className="text-purple-200 text-sm space-y-1 pl-4 list-disc">
                                        <li>L'ingénierie sociale exploite les faiblesses humaines, pas techniques</li>
                                        <li>Le succès dépend fortement de la connaissance de sa cible</li>
                                        <li>La crédibilité est essentielle pour éviter d'éveiller les soupçons</li>
                                        <li>L'urgence est efficace mais devient suspecte si trop prononcée</li>
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                              
                              <CardFooter className="border-t border-purple-500/20 pt-4">
                                <Button 
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                  onClick={resetGame}
                                >
                                  Nouvelle partie
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}