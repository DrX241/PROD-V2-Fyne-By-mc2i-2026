import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, AlertTriangle, Clock, Info, MessageSquare, Terminal, CheckCircle, X, ChevronRight, Award, Download, HelpCircle, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import CyberLayout from '@/components/layout/CyberLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Exemple de simulation de niveau pour la gestion de crise (niveau 5)
const CrisisSimulation: React.FC = () => {
  const params = useParams();
  const levelId = params.id ? parseInt(params.id) : 1;
  const [location, navigate] = useLocation();
  
  // État de la simulation
  const [currentStep, setCurrentStep] = useState(1);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [currentTime, setCurrentTime] = useState("17:00");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [currentDecision, setCurrentDecision] = useState("");
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [scenarioContext, setScenarioContext] = useState({
    companyName: "CyberShield",
    attackType: "Ransomware",
    affectedSystems: ["Serveurs de production", "Base de données clients", "Système ERP"],
    threatActorProfile: "Groupe APT sophistiqué",
    initialImpact: "Systèmes critiques chiffrés, demande de rançon de 2 millions d'euros",
    timeConstraint: "48 heures avant fuite potentielle de données",
    availableResources: ["Équipe SOC (3 personnes)", "Support externe CERT", "Backups datant de J-1"],
    stakeholders: ["Comité exécutif", "Clients majeurs", "Autorités de régulation", "Médias"]
  });
  const [emergencyTeam, setEmergencyTeam] = useState([
    { id: 1, name: "Alex Chen", role: "RSSI", expertise: "Stratégie de cybersécurité", available: true },
    { id: 2, name: "Sarah Leclerc", role: "Analyste SOC", expertise: "Détection et analyse des menaces", available: true },
    { id: 3, name: "Marco Silva", role: "Administrateur système", expertise: "Infrastructure et restauration", available: true },
    { id: 4, name: "Léa Dubois", role: "Communication de crise", expertise: "Relations publiques", available: false },
    { id: 5, name: "Thomas Wagner", role: "Juridique", expertise: "Conformité et obligations légales", available: true }
  ]);
  
  // Étapes de la simulation
  const simulationSteps = [
    {
      id: 1,
      title: "Détection de l'incident",
      description: "Vendredi 17:00 - L'équipe SOC détecte une activité suspecte sur les serveurs de production. Plusieurs systèmes commencent à être inaccessibles et un message de rançon apparaît sur les écrans des opérateurs.",
      task: "Quelle est votre première action face à cette situation ? Détaillez votre approche initiale pour comprendre l'étendue de l'incident.",
      options: [
        "Lancer immédiatement la restauration des sauvegardes pour limiter l'impact",
        "Isoler les systèmes touchés du reste du réseau pour contenir la propagation",
        "Alerter la direction et les autorités avant toute action technique",
        "Analyser les logs et identifier les indicateurs de compromission"
      ],
      aiResponsePrompt: "Tu es un expert en gestion de crise de cybersécurité. Analyse la réponse de l'utilisateur à la situation suivante : une attaque par ransomware vient d'être détectée un vendredi à 17h. Plusieurs systèmes critiques sont touchés. L'utilisateur propose l'action suivante comme première réponse : {{userResponse}}. Évalue cette réponse en considérant : 1) La pertinence face à l'urgence, 2) L'efficacité pour contenir la menace, 3) La conformité aux bonnes pratiques de gestion de crise cyber. Fournis un feedback constructif avec des points forts, des points d'amélioration, et une note sur 10. Ton analyse doit être éducative et précise."
    },
    {
      id: 2,
      title: "Activation de la cellule de crise",
      description: "Vendredi 17:20 - La situation s'aggrave. Les systèmes de production sont entièrement hors-ligne et le ransomware continue de se propager. Vous devez constituer rapidement une équipe de gestion de crise.",
      task: "Qui allez-vous inclure dans votre cellule de crise et quels rôles leur attribuez-vous ? Quels sont vos objectifs immédiats ?",
      options: [],
      aiResponsePrompt: "Tu es un expert en gestion de crise de cybersécurité. Analyse la composition de l'équipe de crise proposée par l'utilisateur pour gérer une attaque par ransomware en cours. L'utilisateur a proposé : {{userResponse}}. Évalue cette réponse en considérant : 1) La pertinence des profils sélectionnés, 2) La couverture des compétences nécessaires (technique, communication, juridique, etc.), 3) La structure de commandement proposée, 4) La définition des objectifs immédiats. Fournis un feedback détaillé avec des points forts, des points d'amélioration et des recommandations spécifiques. Ton analyse doit être éducative et souligner l'importance d'une approche pluridisciplinaire dans la gestion de crise cyber."
    },
    {
      id: 3,
      title: "Analyse et confinement",
      description: "Vendredi 18:15 - Votre équipe a identifié le vecteur d'attaque : un accès VPN compromis. Le ransomware a chiffré plusieurs serveurs critiques et a exfiltré des données potentiellement sensibles.",
      task: "Détaillez votre stratégie de confinement et d'analyse forensique. Quelles mesures prenez-vous pour empêcher la propagation tout en préservant les preuves ?",
      options: [],
      aiResponsePrompt: "Tu es un expert en cybersécurité spécialisé dans la réponse aux incidents. Analyse la stratégie de confinement et d'analyse forensique proposée par l'utilisateur face à une attaque de ransomware provenant d'un accès VPN compromis. L'utilisateur a proposé : {{userResponse}}. Évalue cette réponse en considérant : 1) L'efficacité des mesures de confinement, 2) Le respect des principes d'analyse forensique et de préservation des preuves, 3) L'équilibre entre isolement des systèmes et continuité des opérations, 4) La méthodologie d'investigation pour comprendre l'étendue de la compromission. Fournis un feedback détaillé avec des points forts, des points d'amélioration, et des conseils pratiques spécifiques. Intègre des éléments techniques précis tout en restant pédagogique."
    },
    {
      id: 4,
      title: "Communication et notification",
      description: "Vendredi 20:30 - Vous avez contenu l'incident, mais l'analyse préliminaire révèle que des données clients ont probablement été exfiltrées. Le PDG vous demande conseil sur la stratégie de communication.",
      task: "Qui devez-vous informer à ce stade ? Rédigez un plan de communication pour les différentes parties prenantes (interne, clients, autorités, média).",
      options: [],
      aiResponsePrompt: "Tu es un expert en communication de crise cybersécurité. Analyse le plan de communication proposé par l'utilisateur suite à une attaque par ransomware avec probable exfiltration de données clients. L'utilisateur a proposé : {{userResponse}}. Évalue cette stratégie en considérant : 1) L'identification exhaustive des parties prenantes à informer, 2) Le timing et la priorisation des communications, 3) Le contenu et le ton des messages pour chaque audience, 4) La conformité aux obligations réglementaires (RGPD, etc.), 5) La gestion de la réputation et la transparence. Fournis un feedback détaillé avec des points forts, des points d'amélioration, et des exemples concrets de formulations adaptées. Souligne l'importance de l'équilibre entre transparence et maîtrise de l'information dans un contexte de crise."
    },
    {
      id: 5,
      title: "Décision critique : la rançon",
      description: "Samedi 09:00 - Les attaquants ont contacté l'entreprise et demandent 2 millions d'euros en cryptocurrency. Ils menacent de publier les données exfiltrées sous 48 heures si le paiement n'est pas effectué.",
      task: "Quelle est votre recommandation concernant le paiement de la rançon ? Justifiez votre position et présentez les alternatives possibles.",
      options: [
        "Payer la rançon pour protéger les données clients et accélérer la reprise d'activité",
        "Refuser catégoriquement le paiement et se concentrer sur la restauration des systèmes",
        "Entamer des négociations pour gagner du temps tout en préparant les alternatives",
        "Consulter les autorités et suivre leurs recommandations"
      ],
      aiResponsePrompt: "Tu es un expert en éthique et stratégie de cybersécurité. Analyse la position de l'utilisateur concernant le paiement d'une rançon de 2 millions d'euros suite à une attaque par ransomware avec menace de publication de données sensibles. L'utilisateur recommande : {{userResponse}}. Évalue cette recommandation en considérant : 1) Les implications éthiques et légales, 2) Les conséquences pratiques sur la restauration et la confidentialité des données, 3) Les précédents et statistiques concernant l'efficacité du paiement, 4) Les alternatives proposées et leur faisabilité. Fournis une analyse nuancée qui présente les arguments en faveur et contre cette position, sans jugement tranché, car il n'existe pas de réponse parfaite à ce dilemme. Souligne les facteurs contextuels qui peuvent influencer cette décision et les mesures complémentaires à prendre quelle que soit l'option choisie."
    },
    {
      id: 6,
      title: "Plan de reprise d'activité",
      description: "Samedi 14:00 - La direction a suivi votre recommandation concernant la rançon. Vous devez maintenant présenter un plan de reprise d'activité pour restaurer les systèmes critiques.",
      task: "Élaborez un plan de reprise détaillé avec priorisation des systèmes, estimation des délais et ressources nécessaires.",
      options: [],
      aiResponsePrompt: "Tu es un expert en continuité d'activité et reprise après sinistre informatique. Analyse le plan de reprise proposé par l'utilisateur suite à une attaque par ransomware ayant touché des systèmes critiques. L'utilisateur a élaboré le plan suivant : {{userResponse}}. Évalue ce plan en considérant : 1) La méthodologie de priorisation des systèmes (critères business vs techniques), 2) Le réalisme des délais estimés, 3) L'identification et l'allocation des ressources nécessaires, 4) La gestion des dépendances entre systèmes, 5) Les mesures de validation/sécurisation des systèmes restaurés. Fournis un feedback constructif avec des points forts, des suggestions d'amélioration, et des recommandations concrètes basées sur les meilleures pratiques du domaine (NIST, ISO 27001, etc.). Ton analyse doit être à la fois technique et orientée business pour refléter les enjeux multidimensionnels de la reprise d'activité."
    },
    {
      id: 7,
      title: "Leçons apprises et amélioration",
      description: "Lundi 10:00 - Les systèmes critiques ont été restaurés et l'activité a repris. Le comité exécutif vous demande un rapport préliminaire sur l'incident et des recommandations pour éviter qu'une telle situation ne se reproduise.",
      task: "Identifiez les principales failles de sécurité exploitées et proposez un plan d'action pour renforcer la posture de sécurité de l'entreprise.",
      options: [],
      aiResponsePrompt: "Tu es un consultant senior en cybersécurité spécialisé dans l'analyse post-incident. Analyse le rapport d'amélioration proposé par l'utilisateur suite à une attaque par ransomware ayant exploité un accès VPN compromis. L'utilisateur a identifié les failles suivantes et proposé ces améliorations : {{userResponse}}. Évalue cette analyse en considérant : 1) La pertinence des failles identifiées (cause racine vs symptômes), 2) L'exhaustivité de l'analyse technique et organisationnelle, 3) Le réalisme et la priorisation des mesures proposées, 4) L'alignement avec les standards de l'industrie (NIST, CIS, etc.), 5) La prise en compte de la dimension humaine et des processus. Fournis un feedback détaillé avec une évaluation des points forts, des angles morts potentiels, et des recommandations complémentaires. Ton analyse doit être stratégique tout en incluant des mesures concrètes et techniquement précises, organisées en actions à court, moyen et long terme."
    }
  ];
  
  // Obtenir les détails du niveau actuel
  const getCurrentSimulationStep = () => {
    return simulationSteps.find(step => step.id === currentStep) || simulationSteps[0];
  };
  
  // Fonction pour mettre à jour l'heure simulée
  const updateSimulatedTime = () => {
    // Convertir l'heure de départ (17:00) en minutes
    const startHour = 17;
    const startMinutes = 0;
    const totalStartMinutes = startHour * 60 + startMinutes;
    
    // Ajouter les minutes écoulées
    const totalMinutes = totalStartMinutes + elapsedMinutes;
    
    // Convertir en format heure:minute
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Formater l'heure (avec zéro devant si nécessaire)
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    setCurrentTime(`${formattedHours}:${formattedMinutes}`);
  };
  
  // Effet pour mettre à jour l'heure en fonction de l'étape
  useEffect(() => {
    // Temps écoulé par étape (en minutes)
    const timePerStep = [0, 0, 20, 55, 210, 960, 1310, 2530];
    if (currentStep <= timePerStep.length) {
      setElapsedMinutes(timePerStep[currentStep - 1]);
      updateSimulatedTime();
    }
  }, [currentStep]);
  
  // Fonction pour soumettre une réponse à l'étape actuelle
  const submitResponse = async () => {
    if (!currentDecision.trim()) {
      toast({
        title: "Réponse requise",
        description: "Veuillez fournir une réponse détaillée pour continuer.",
        variant: "destructive",
      });
      return;
    }
    
    // Enregistrer la réponse
    setUserResponses({
      ...userResponses,
      [currentStep.toString()]: currentDecision
    });
    
    // Simulation de l'analyse par Azure OpenAI
    setIsLoadingResponse(true);
    
    try {
      // Ici, dans une implémentation réelle, vous feriez un appel à Azure OpenAI
      // Pour la démonstration, nous allons simuler la réponse après un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler une réponse d'IA en fonction de l'étape
      const step = getCurrentSimulationStep();
      
      // Dans la vraie implémentation, vous utiliseriez le prompt avec la réponse de l'utilisateur
      // et enverriez cette requête à Azure OpenAI
      const prompt = step.aiResponsePrompt.replace("{{userResponse}}", currentDecision);
      
      // Simuler différentes réponses d'IA basées sur l'étape
      let simulatedAIResponse = "";
      
      switch(currentStep) {
        case 1:
          simulatedAIResponse = `**Analyse de votre réponse initiale face à l'incident ransomware**

**Points forts:**
- Votre approche priorise l'isolement des systèmes touchés, ce qui est crucial pour limiter la propagation du ransomware.
- Vous démontrez une bonne compréhension de l'urgence de la situation avec des actions concrètes.

**Points d'amélioration:**
- Considérez l'importance d'une collecte préliminaire d'informations avant d'isoler complètement les systèmes.
- Une action de documentation immédiate de la situation initiale renforcerait votre approche.

**Note: 8/10** - Votre réponse est globalement alignée avec les bonnes pratiques en matière de réponse à incident.

**Recommandation:**
En parallèle de l'isolation, lancez immédiatement la collecte d'indicateurs de compromission et activez formellement le plan de réponse aux incidents. Pensez également à désigner rapidement un coordinateur de crise pour centraliser les informations.`;
          break;
          
        case 2:
          simulatedAIResponse = `**Analyse de votre composition d'équipe de crise**

**Points forts:**
- Excellente inclusion de profils variés couvrant les aspects techniques, juridiques et communication.
- La structure de commandement proposée est claire avec des rôles bien définis.

**Points d'amélioration:**
- Pensez à inclure un représentant de la direction générale pour faciliter les décisions stratégiques.
- Prévoyez des relais pour les membres clés afin d'assurer une continuité sur la durée.

**Recommandation:**
Établissez dès le départ un rythme précis de points de situation (toutes les 2-3 heures initialement) et un processus de documentation continue. Assurez-vous aussi que chaque membre comprend les limites de ses responsabilités et ses pouvoirs de décision.`;
          break;
          
        case 3:
          simulatedAIResponse = `**Analyse de votre stratégie de confinement et d'analyse forensique**

**Points forts:**
- Votre approche équilibre bien isolement et préservation des preuves.
- La méthodologie proposée suit les standards d'investigation numérique.

**Points d'amélioration:**
- Renforcez la séquence de capture des données volatiles (mémoire, processus actifs) avant toute action pouvant les altérer.
- Précisez davantage votre méthodologie pour déterminer l'étendue complète de la compromission.

**Recommandation technique:**
Utilisez des outils spécialisés comme Volatility pour l'analyse mémoire et établissez une timeline précise de la compromission. Mettez également en place un monitoring renforcé des points d'accès non encore compromis qui pourraient révéler des tentatives de mouvement latéral.`;
          break;
          
        case 4:
          simulatedAIResponse = `**Analyse de votre plan de communication de crise**

**Points forts:**
- Votre stratégie couvre bien les différentes parties prenantes avec des messages adaptés.
- Vous avez correctement priorisé les communications selon l'urgence et l'impact.

**Points d'amélioration:**
- Développez davantage la communication interne pour éviter les rumeurs et maintenir la confiance.
- Préparez des réponses aux questions difficiles que pourraient poser les médias.

**Sur la conformité réglementaire:**
Votre plan respecte les obligations de notification RGPD, mais précisez les délais exacts (72h) et les informations minimales à fournir aux autorités. Prévoyez également un suivi régulier avec mise à jour des informations aux autorités à mesure que votre analyse progresse.

**Exemple de formulation pour les clients:**
"Nous avons détecté un incident de sécurité qui pourrait affecter certaines de vos données. Nos équipes travaillent activement pour résoudre la situation et protéger vos informations. Nous vous fournirons plus de détails dès que possible, et mettons en place dès maintenant des mesures préventives pour renforcer votre protection..."`;
          break;
          
        case 5:
          simulatedAIResponse = `**Analyse de votre position sur le paiement de la rançon**

**Arguments en faveur de votre approche:**
- Votre position reflète une évaluation pragmatique de la situation spécifique.
- Vous avez correctement identifié les risques associés à chaque option.

**Considérations additionnelles:**
- Le paiement d'une rançon ne garantit pas la récupération des données ni la non-publication des informations volées.
- Selon le FBI et Europol, le paiement peut encourager d'autres attaques et financer potentiellement des activités criminelles.

**Facteurs contextuels importants:**
- La capacité de récupération à partir des sauvegardes est un facteur déterminant dans cette décision.
- Les obligations légales et réglementaires varient selon les juridictions et peuvent influencer cette décision.

**Mesures complémentaires essentielles:**
- Quelle que soit la décision, documentez le processus de prise de décision et ses justifications.
- Engagez des experts en négociation cyber si vous décidez d'interagir avec les attaquants.
- Préparez-vous à la possibilité que les attaquants ne respectent pas leurs engagements, même en cas de paiement.`;
          break;
          
        case 6:
          simulatedAIResponse = `**Analyse de votre plan de reprise d'activité**

**Points forts:**
- Votre méthodologie de priorisation basée sur l'impact business est excellente.
- Le plan inclut des points de validation de sécurité avant reconnexion, ce qui est crucial.

**Opportunités d'amélioration:**
- Ajoutez des indicateurs de performance précis pour mesurer le succès de la reprise.
- Renforcez l'aspect vérification de l'intégrité des données restaurées.

**Recommandations basées sur les meilleures pratiques:**
- Suivez le cadre NIST SP 800-34 pour structurer votre plan de reprise.
- Mettez en place un processus de "leçons apprises" en continu pendant la reprise.
- Prévoyez des points de décision clairs avec critères objectifs pour passer d'une phase à l'autre.

**Sur l'allocation des ressources:**
Votre plan pourrait bénéficier d'une matrice RACI claire pour chaque système critique, définissant les responsabilités précises de chaque équipe dans le processus de restauration.`;
          break;
          
        case 7:
          simulatedAIResponse = `**Analyse de votre rapport post-incident**

**Points forts:**
- Excellente identification de la cause racine et des facteurs contributifs.
- Vos recommandations couvrent bien les aspects techniques, humains et organisationnels.

**Angles morts potentiels:**
- Considérez davantage le rôle de la culture de sécurité organisationnelle comme facteur sous-jacent.
- Renforcez l'aspect mesure continue de l'efficacité des contrôles proposés.

**Recommandations stratégiques complémentaires:**

**Actions à court terme (0-30 jours):**
- Mise en œuvre d'une authentification multifacteur sur tous les accès distants
- Revue complète des privilèges administratifs et réduction selon le principe du moindre privilège
- Révision immédiate de la stratégie de sauvegarde et de sa ségrégation réseau

**Actions à moyen terme (1-6 mois):**
- Déploiement d'une solution EDR avancée avec capacités de threat hunting
- Mise en place d'exercices de simulation d'incident réguliers
- Segmentation réseau renforcée basée sur une architecture zero-trust

**Actions à long terme (6+ mois):**
- Programme de transformation de la culture de sécurité à l'échelle de l'organisation
- Développement d'un SOC interne ou engagement avec un service MDR externe
- Revue architecturale complète avec intégration de security-by-design

Cette approche échelonnée permettra d'améliorer rapidement votre posture de sécurité tout en construisant une résilience durable.`;
          break;
          
        default:
          simulatedAIResponse = "Analyse en cours...";
      }
      
      setAiResponse(simulatedAIResponse);
      setFeedbackDialogOpen(true);
      setIsLoadingResponse(false);
      
    } catch (error) {
      console.error("Erreur lors de l'analyse par IA:", error);
      setIsLoadingResponse(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'analyse de votre réponse.",
        variant: "destructive",
      });
    }
  };
  
  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep < simulationSteps.length) {
      setCurrentStep(currentStep + 1);
      setCurrentDecision("");
      setFeedbackDialogOpen(false);
    } else {
      // Simulation terminée
      setSimulationComplete(true);
      
      // Générer des résultats d'évaluation simulés
      setEvaluationResults({
        overallScore: 85,
        performanceMetrics: {
          rapidité: 80,
          pertinence: 90,
          communication: 85,
          coordination: 75,
          stratégie: 95
        },
        skillsGained: {
          gestionCrise: 25,
          analyseMenaces: 15,
          communication: 20,
          leadershipCrise: 30,
          réponseIncidents: 25
        },
        feedback: "Excellente performance globale dans la gestion de cette crise. Vous avez particulièrement brillé dans l'analyse stratégique et la prise de décision. Des axes d'amélioration existent dans la coordination des équipes et la rapidité de certaines actions initiales.",
        recommendedResources: [
          "Guide ANSSI de réponse aux incidents",
          "Framework NIST Cybersecurity",
          "ISO 27035 : Gestion des incidents de sécurité"
        ]
      });
    }
  };
  
  // Fonction pour terminer la simulation et revenir à la sélection des niveaux
  const completeLevel = () => {
    navigate('/cyber/ascension');
    
    // Dans une implémentation réelle, vous mettriez à jour la progression du joueur ici
    toast({
      title: "Niveau complété !",
      description: "Vous avez débloqué de nouvelles compétences et le niveau suivant.",
    });
  };
  
  // Fonction pour afficher l'aide
  const showHelp = () => {
    setHelpDialogOpen(true);
  };
  
  return (
    <CyberLayout>
      <PageTitle title={`CYBERASCENSION - NIVEAU ${levelId}`} />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white pb-16">
        <div className="container mx-auto px-4 pt-6">
          <Button 
            variant="outline" 
            className="mb-6 bg-black/20 border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate('/cyber/ascension')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          
          {/* Informations du niveau */}
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 rounded-lg p-4 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <AlertTriangle className="h-8 w-8 mr-3 text-red-300" />
                <div>
                  <h1 className="text-2xl font-bold">ALERTE ROUGE : Gestion de crise cyber</h1>
                  <p className="text-red-200">Apprenez à réagir efficacement à une cyberattaque majeure</p>
                </div>
              </div>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="outline" className="mr-2 border-white/20" onClick={showHelp}>
                        <HelpCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aide & Ressources</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="bg-black/30 px-3 py-2 rounded-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-red-400" />
                  <span className="font-mono text-lg">{currentTime}</span>
                </div>
              </div>
            </div>
          </div>
          
          {!simulationStarted && !simulationComplete && (
            <div className="bg-black/40 border border-gray-800 rounded-lg p-8 mb-8">
              <div className="max-w-3xl mx-auto text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-3xl font-bold mb-4">Crise Imminente</h2>
                <p className="text-xl mb-6">
                  Vendredi, 17h00. Une attaque par ransomware frappe votre entreprise.
                  Les systèmes critiques sont touchés, la production est à l'arrêt, et la pression monte à chaque minute.
                </p>
                <p className="text-gray-300 mb-8">
                  En tant que responsable sécurité, vous devez gérer cette crise majeure et limiter les dégâts.
                  Vos décisions auront un impact direct sur l'entreprise, ses clients et sa réputation.
                </p>
                
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                  onClick={() => setSimulationStarted(true)}
                >
                  Commencer la simulation de crise
                </Button>
              </div>
            </div>
          )}
          
          {simulationStarted && !simulationComplete && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Contexte de la crise */}
                <div className="bg-black/30 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-400" />
                    Contexte de la crise
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Entreprise:</span>
                      <span className="ml-2 text-white">{scenarioContext.companyName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type d'attaque:</span>
                      <span className="ml-2 text-white">{scenarioContext.attackType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Systèmes affectés:</span>
                      <div className="mt-1 ml-2">
                        {scenarioContext.affectedSystems.map((system, index) => (
                          <div key={index} className="flex items-start">
                            <div className="mr-2">•</div>
                            <div>{system}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Impact initial:</span>
                      <div className="mt-1 ml-2 text-white">{scenarioContext.initialImpact}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Contrainte de temps:</span>
                      <div className="mt-1 ml-2 text-white">{scenarioContext.timeConstraint}</div>
                    </div>
                  </div>
                </div>
                
                {/* Équipe disponible */}
                <div className="bg-black/30 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-400" />
                    Équipe d'urgence
                  </h3>
                  <div className="space-y-2 text-sm">
                    {emergencyTeam.map((member) => (
                      <div key={member.id} className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-gray-400 text-xs">{member.role}</div>
                        </div>
                        <Badge variant={member.available ? "outline" : "secondary"}>
                          {member.available ? "Disponible" : "Indisponible"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progression de la simulation */}
                <div className="bg-black/30 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Timer className="h-5 w-5 mr-2 text-violet-400" />
                    Progression de la simulation
                  </h3>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-400">
                            Étape {currentStep}/{simulationSteps.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-400">
                            {Math.round((currentStep / simulationSteps.length) * 100)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={(currentStep / simulationSteps.length) * 100} className="h-2 bg-gray-700 mt-1" />
                    </div>
                    
                    <div className="space-y-2">
                      {simulationSteps.map((step) => (
                        <div key={step.id} className={`flex items-center ${step.id === currentStep ? 'text-white' : step.id < currentStep ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
                            step.id === currentStep ? 'bg-blue-900 border border-blue-500' : 
                            step.id < currentStep ? 'bg-green-900 border border-green-500' : 
                            'bg-gray-800 border border-gray-700'
                          }`}>
                            {step.id < currentStep ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-xs">{step.id}</span>
                            )}
                          </div>
                          <span className={`text-sm ${step.id === currentStep ? 'font-medium' : ''}`}>
                            {step.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Étape actuelle */}
              <div className="bg-black/40 border border-gray-800 rounded-lg overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Étape {currentStep}: {getCurrentSimulationStep().title}</h2>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-400">{currentTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Situation</h3>
                    <p className="text-gray-300">{getCurrentSimulationStep().description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Terminal className="h-5 w-5 mr-2 text-blue-400" />
                      Votre mission
                    </h3>
                    <p className="text-blue-200 mb-4">{getCurrentSimulationStep().task}</p>
                    
                    {getCurrentSimulationStep().options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 mb-6">
                        {getCurrentSimulationStep().options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              currentDecision === option 
                                ? 'border-blue-500 bg-blue-900/20' 
                                : 'border-gray-700 bg-black/20 hover:bg-gray-800/50 hover:border-gray-600'
                            } cursor-pointer transition-colors`}
                            onClick={() => setCurrentDecision(option)}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-2">
                        {getCurrentSimulationStep().options.length > 0 
                          ? "Vous pouvez sélectionner une option ou fournir une réponse personnalisée :" 
                          : "Votre réponse :"}
                      </p>
                      <Textarea
                        placeholder="Détaillez votre approche..."
                        className="min-h-[150px] bg-gray-900 border-gray-700"
                        value={currentDecision}
                        onChange={(e) => setCurrentDecision(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                      onClick={submitResponse}
                      disabled={isLoadingResponse || !currentDecision.trim()}
                    >
                      {isLoadingResponse ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Analyse en cours...
                        </>
                      ) : (
                        <>Soumettre ma réponse</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Résultats de la simulation */}
          {simulationComplete && evaluationResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black/40 border border-gray-800 rounded-lg p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mb-4">
                  <Award className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Mission accomplie !</h2>
                <p className="text-xl text-gray-300">Vous avez géré avec succès la crise cyber</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Performance globale</h3>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-32 h-32">
                        <circle
                          className="text-gray-700"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                        />
                        <circle
                          className="text-blue-500"
                          strokeWidth="8"
                          strokeDasharray={360}
                          strokeDashoffset={360 - (360 * evaluationResults.overallScore) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="56"
                          cx="64"
                          cy="64"
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <span className="text-2xl font-bold">{evaluationResults.overallScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(evaluationResults.performanceMetrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize">{key}</span>
                          <span className="text-blue-400">{value}%</span>
                        </div>
                        <Progress value={value as number} className="h-2 bg-gray-700" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Compétences développées</h3>
                  <div className="space-y-4">
                    {Object.entries(evaluationResults.skillsGained).map(([skill, points]) => (
                      <div key={skill} className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                          <span className="font-bold text-blue-400">+{points}</span>
                        </div>
                        <div>
                          <div className="font-medium capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-xs text-gray-400">Points d'expérience gagnés</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Feedback de l'expert</h3>
                <div className="bg-black/30 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300">{evaluationResults.feedback}</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Ressources recommandées</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {evaluationResults.recommendedResources.map((resource, index) => (
                    <div key={index} className="flex items-center bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                      <Download className="h-5 w-5 mr-2 text-blue-400" />
                      <span>{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
                  onClick={completeLevel}
                >
                  Terminer et revenir à la carte des niveaux
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Dialog de feedback IA */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Analyse de votre réponse</DialogTitle>
            <DialogDescription className="text-gray-400">
              Feedback généré par Azure OpenAI basé sur votre décision
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 text-white">
              {aiResponse.split('\n\n').map((paragraph, index) => (
                <div key={index} className="space-y-2">
                  {paragraph.split('\n').map((line, lineIndex) => {
                    // Détection des titres en gras (**titre**)
                    if (line.match(/^\*\*.*\*\*$/)) {
                      return <h3 key={lineIndex} className="font-bold text-blue-400">{line.replace(/\*\*/g, '')}</h3>;
                    }
                    
                    // Détection des éléments en gras au milieu du texte
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    if (parts.length > 1) {
                      return (
                        <p key={lineIndex}>
                          {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={partIndex} className="text-blue-300">{part.replace(/\*\*/g, '')}</strong>;
                            }
                            return <span key={partIndex}>{part}</span>;
                          })}
                        </p>
                      );
                    }
                    
                    // Ligne normale
                    return <p key={lineIndex}>{line}</p>;
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              onClick={goToNextStep}
            >
              Continuer <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog d'aide */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Aide & Ressources</DialogTitle>
            <DialogDescription className="text-gray-400">
              Conseils pour gérer efficacement une crise cyber
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Principes fondamentaux de gestion de crise cyber</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Prioriser le confinement avant l'éradication pour limiter la propagation</li>
                  <li>Constituer une équipe pluridisciplinaire (technique, juridique, communication)</li>
                  <li>Documenter toutes les actions et découvertes en temps réel</li>
                  <li>Communiquer de manière transparente mais contrôlée</li>
                  <li>Préserver les preuves pour l'analyse forensique</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Modèle PICERL de réponse aux incidents</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">P - Préparation :</span>
                    <p className="text-gray-300 text-sm">Avoir un plan de réponse aux incidents prédéfini et des ressources disponibles</p>
                  </div>
                  <div>
                    <span className="font-medium">I - Identification :</span>
                    <p className="text-gray-300 text-sm">Détecter et analyser l'incident, déterminer son étendue et sa gravité</p>
                  </div>
                  <div>
                    <span className="font-medium">C - Confinement :</span>
                    <p className="text-gray-300 text-sm">Isoler les systèmes compromis pour empêcher la propagation</p>
                  </div>
                  <div>
                    <span className="font-medium">E - Éradication :</span>
                    <p className="text-gray-300 text-sm">Éliminer la menace des systèmes affectés</p>
                  </div>
                  <div>
                    <span className="font-medium">R - Récupération :</span>
                    <p className="text-gray-300 text-sm">Restaurer les systèmes et retourner à l'état normal</p>
                  </div>
                  <div>
                    <span className="font-medium">L - Leçons apprises :</span>
                    <p className="text-gray-300 text-sm">Analyser l'incident et améliorer les processus</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Communication de crise</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Désigner un porte-parole unique</li>
                  <li>Préparer des messages clés adaptés à chaque audience</li>
                  <li>Communiquer régulièrement, même sans nouvelle information substantielle</li>
                  <li>Être transparent sur ce qui est connu, et honnête sur ce qui ne l'est pas</li>
                  <li>Éviter les promesses qui ne peuvent être tenues</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Cadre juridique et réglementaire</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>RGPD : Notification obligatoire sous 72h pour les violations de données</li>
                  <li>NIS2 : Obligations de signalement pour les opérateurs de services essentiels</li>
                  <li>Sectorielles : Réglementations spécifiques selon le secteur d'activité</li>
                  <li>Contractuelles : Obligations envers clients, partenaires, assureurs</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-blue-400 mb-2">Ressources utiles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-800 rounded-md">Guide ANSSI - Gestion de crise cyber</div>
                  <div className="p-2 bg-gray-800 rounded-md">NIST SP 800-61 - Computer Security Incident Handling Guide</div>
                  <div className="p-2 bg-gray-800 rounded-md">ISO/IEC 27035 - Information Security Incident Management</div>
                  <div className="p-2 bg-gray-800 rounded-md">CISA - Cyber Incident Response Guide</div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setHelpDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CyberLayout>
  );
};

export default CrisisSimulation;