import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Database,
  Send,
  Check,
  PlayCircle,
  Sparkles,
  BarChart,
  Brain,
  MessageSquare,
  User,
  Timer,
  Loader2,
  ArrowRight,
  HelpCircle,
  Star,
  ClipboardList,
  FileBarChart
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Définir les étapes possibles pour une session Data OPS
type DataOpsStage = 'introduction' | 'exploration' | 'analysis' | 'recommendation' | 'presentation' | 'feedback' | 'complete';

interface DataOpsMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: number;
  type?: DataOpsStage;
  data?: any; // Pour les tableaux de données, graphiques, etc.
}

interface DataOpsSession {
  id: string;
  scenario: string;
  domain: string;
  level: 'débutant' | 'intermédiaire' | 'avancé';
  currentStage: DataOpsStage;
  messages: DataOpsMessage[];
  createdAt: number;
  score?: number;
}

interface ChoiceOption {
  id: string;
  text: string;
  feedback?: string;
  isCorrect?: boolean;
  points?: number;
}

const DataOpsSimulation = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<DataOpsSession | null>(null);
  const [messages, setMessages] = useState<DataOpsMessage[]>([]);
  const [currentStage, setCurrentStage] = useState<DataOpsStage>('introduction');
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // États pour le système de QCM
  const [options, setOptions] = useState<ChoiceOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(100);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  
  // Simuler le début d'une nouvelle session
  const startNewSession = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un appel à l'API pour démarrer une nouvelle session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Message d'introduction
      const introMessage: DataOpsMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `# Bienvenue dans DATA OPS !

Je suis votre animateur pour cette simulation de mission data.

Dans cette simulation, vous allez incarner un analyste data confronté à une situation professionnelle réaliste :

- Un contexte métier spécifique (entreprise, ONG, santé...)
- Des données à explorer et analyser
- Des décisions stratégiques à prendre
- Une présentation à faire à des décideurs

À chaque étape, vous devrez choisir la meilleure approche parmi les options proposées.`,
        timestamp: Date.now(),
        type: 'introduction'
      };
      
      // Options pour commencer
      const startOptions: ChoiceOption[] = [
        { 
          id: 'start_ecommerce', 
          text: 'Analyser l\'abandon de panier pour une plateforme e-commerce',
        },
        { 
          id: 'start_ong', 
          text: 'Optimiser l\'efficacité des programmes d\'aide humanitaire',
        },
        { 
          id: 'start_sante', 
          text: 'Réduire le taux de réadmission dans un hôpital régional',
        },
        { 
          id: 'start_logistique', 
          text: 'Améliorer la ponctualité des livraisons pour une entreprise de transport',
        }
      ];
      
      // Création de la nouvelle session
      const newSession: DataOpsSession = {
        id: Date.now().toString(),
        scenario: 'Sélection de mission',
        domain: '',
        level: 'intermédiaire',
        currentStage: 'introduction',
        messages: [introMessage],
        createdAt: Date.now(),
        score: 0
      };
      
      setSession(newSession);
      setMessages([introMessage]);
      setCurrentStage('introduction');
      setOptions(startOptions);
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentScore(0);
      setMaxPossibleScore(100);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de démarrer une nouvelle session. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer la soumission d'un choix
  const submitChoice = async () => {
    if (!selectedOption || isLoading) return;
    
    // Trouver l'option sélectionnée
    const chosenOption = options.find(opt => opt.id === selectedOption);
    if (!chosenOption) return;
    
    // Créer le message utilisateur
    const userMessage: DataOpsMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chosenOption.text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simuler un délai API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le score si applicable
      if (chosenOption.points) {
        setCurrentScore(prev => prev + chosenOption.points);
      }
      
      // Gérer les différentes étapes et transitions
      let responseContent = '';
      let responseType: DataOpsStage = currentStage;
      let nextStage = currentStage;
      let nextOptions: ChoiceOption[] = [];
      
      // Première sélection de scénario
      if (currentStage === 'introduction') {
        // Choisir le scénario basé sur l'option sélectionnée
        if (selectedOption.includes('ecommerce')) {
          responseContent = generateEcommerceScenario();
          setCurrentScenario('ecommerce');
        } else if (selectedOption.includes('ong')) {
          responseContent = generateOngScenario();
          setCurrentScenario('ong');
        } else if (selectedOption.includes('sante')) {
          responseContent = generateSanteScenario();
          setCurrentScenario('sante');
        } else {
          responseContent = generateLogistiqueScenario();
          setCurrentScenario('logistique');
        }
        
        // Passer à l'étape d'exploration
        responseType = 'exploration';
        nextStage = 'exploration';
        
        // Options pour l'exploration des données selon le scénario
        nextOptions = generateExplorationOptions(selectedOption);
      }
      
      // Étape d'exploration des données
      else if (currentStage === 'exploration') {
        // Feedback sur le choix d'exploration
        const feedback = generateExplorationFeedback(selectedOption);
        
        // Réponse principale qui varie selon le scénario
        responseContent = feedback;
        
        // Passer à l'étape d'analyse
        responseType = 'analysis';
        nextStage = 'analysis';
        
        // Options pour l'analyse
        nextOptions = generateAnalysisOptions(currentScenario);
      }
      
      // Étape d'analyse
      else if (currentStage === 'analysis') {
        // Feedback sur l'analyse choisie
        const feedback = generateAnalysisFeedback(selectedOption);
        
        // Contenu de la réponse qui dépend du scénario
        responseContent = feedback;
        
        // Passer à l'étape de recommandation
        responseType = 'recommendation';
        nextStage = 'recommendation';
        
        // Options pour les recommandations
        nextOptions = generateRecommendationOptions(currentScenario);
      }
      
      // Étape de recommandation
      else if (currentStage === 'recommendation') {
        // Feedback sur la recommandation choisie
        const feedback = generateRecommendationFeedback(selectedOption);
        
        // Contenu de la réponse
        responseContent = feedback;
        
        // Passer à l'étape de présentation
        responseType = 'presentation';
        nextStage = 'presentation';
        
        // Options pour la présentation
        nextOptions = generatePresentationOptions(currentScenario);
      }
      
      // Étape de présentation au client/directeur
      else if (currentStage === 'presentation') {
        // Feedback sur la présentation
        const feedback = generatePresentationFeedback(selectedOption);
        
        // Contenu de la réponse avec questions du directeur
        responseContent = feedback;
        
        // Passer à l'étape de feedback final
        responseType = 'feedback';
        nextStage = 'feedback';
        
        // Options pour terminer
        nextOptions = [
          { 
            id: 'view_results', 
            text: 'Voir mes résultats et mon évaluation',
          }
        ];
      }
      
      // Étape de feedback final
      else if (currentStage === 'feedback') {
        // Score final sur 100
        const finalScore = Math.min(100, Math.max(0, currentScore));
        
        // Générer le feedback final basé sur le score
        responseContent = generateFinalFeedback(finalScore, currentScenario);
        
        // Terminer la session
        responseType = 'feedback';
        nextStage = 'complete';
        
        // Options pour recommencer
        nextOptions = [
          { 
            id: 'restart', 
            text: 'Commencer une nouvelle mission', 
          },
          { 
            id: 'exit', 
            text: 'Quitter la simulation', 
          }
        ];
      }
      
      // Étape finale, possibilité de recommencer
      else if (currentStage === 'complete') {
        if (selectedOption === 'restart') {
          // Recommencer avec un nouveau scénario
          setIsLoading(false);
          return startNewSession();
        } else {
          responseContent = "Merci d'avoir participé à cette simulation DATA OPS ! Vous pouvez revenir au menu principal.";
          nextOptions = [
            { 
              id: 'restart', 
              text: 'Finalement, je voudrais essayer une autre mission', 
            },
            { 
              id: 'exit', 
              text: 'Quitter la simulation', 
            }
          ];
        }
      }
      
      // Créer le message de réponse de l'assistant
      const assistantMessage: DataOpsMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
        type: responseType
      };
      
      // Mettre à jour les états
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStage(nextStage);
      setOptions(nextOptions);
      setSelectedOption(null);
      
      // Mettre à jour la session
      if (session) {
        setSession({
          ...session,
          currentStage: nextStage,
          messages: [...session.messages, userMessage, assistantMessage],
          score: currentScore
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors du traitement de votre choix. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer le scénario E-commerce
  const generateEcommerceScenario = () => {
    return `# Mission Data Analytics - E-commerce

Vous êtes Data Analyst chez TechMarket, une plateforme d'e-commerce qui connaît une croissance rapide mais aussi un taux préoccupant d'abandon de panier.

**Contexte :** La directrice marketing souhaite comprendre pourquoi tant de clients quittent le site sans finaliser leurs achats. Elle a besoin de recommandations concrètes pour la prochaine campagne marketing qui sera lancée dans 48h.

**Données disponibles :** Vous disposez des données de transactions des 3 derniers mois (extrait ci-dessous).

**Votre objectif :** Analyser ces données pour identifier les patterns de l'abandon et formuler 2-3 recommandations basées sur les données.

Voici un extrait des données transactions :

| date | customer_id | product_category | price | quantity | payment_method | delivery_time_days | abandoned |
|------|-------------|------------------|-------|----------|----------------|-------------------|-----------|
| 2024-04-12 | C1045 | Electronics | 149.99 | 1 | Credit Card | 3 | FALSE |
| 2024-04-12 | C2189 | Clothing | 39.99 | 2 | PayPal | 4 | TRUE |
| 2024-04-13 | C1045 | Home | 59.99 | 1 | Credit Card | 5 | FALSE |
| 2024-04-14 | C3267 | Electronics | 299.99 | 1 | Credit Card | 3 | FALSE |
| 2024-04-15 | C1892 | Clothing | 29.99 | 3 | PayPal | 6 | TRUE |

**Étape actuelle :** Exploration des données. Quelles colonnes allez-vous examiner en priorité ?`;
  };

  // Générer le scénario ONG
  const generateOngScenario = () => {
    return `# Mission Data Analytics - ONG Humanitaire

Vous êtes Data Analyst pour WorldHelp, une ONG humanitaire qui intervient dans plusieurs régions du monde.

**Contexte :** Le conseil d'administration s'inquiète de l'efficacité des programmes d'aide. Les financements sont en baisse et il est crucial d'optimiser les ressources.

**Données disponibles :** Vous disposez des données des interventions des 12 derniers mois (extrait ci-dessous).

**Votre objectif :** Analyser ces données pour identifier les facteurs qui influencent l'efficacité des programmes et proposer des recommandations pour améliorer l'impact des interventions futures.

Voici un extrait des données d'intervention :

| region | date | aid_type | beneficiaries | cost_usd | local_partner | success_rating |
|--------|------|----------|---------------|----------|---------------|----------------|
| East Africa | 2024-03-05 | Food | 1250 | 15000 | Yes | 4.2 |
| South Asia | 2024-03-10 | Medical | 780 | 22000 | Yes | 4.7 |
| East Africa | 2024-03-15 | Water | 2100 | 18500 | No | 3.5 |
| West Africa | 2024-03-20 | Food | 950 | 12000 | Yes | 4.0 |
| South Asia | 2024-03-25 | Shelter | 450 | 32000 | No | 3.8 |

**Étape actuelle :** Exploration des données. Quelles colonnes allez-vous examiner en priorité ?`;
  };

  // Générer le scénario Santé
  const generateSanteScenario = () => {
    return `# Mission Data Analytics - Santé

Vous êtes Data Analyst pour l'hôpital régional Saint-Charles qui cherche à améliorer ses protocoles de traitement.

**Contexte :** Le directeur médical s'inquiète du taux de réadmission des patients traités pour certaines pathologies chroniques. Il souhaite identifier les facteurs qui contribuent à ces réadmissions pour améliorer les protocoles.

**Données disponibles :** Vous disposez des données anonymisées de patients sur les 6 derniers mois (extrait ci-dessous).

**Votre objectif :** Analyser ces données pour identifier les facteurs de risque de réadmission et proposer des pistes d'amélioration pour les protocoles de traitement.

Voici un extrait des données patients :

| patient_id | age | gender | condition | treatment | days_to_recovery | readmission |
|------------|-----|--------|-----------|-----------|------------------|-------------|
| P10056 | 45 | M | Diabetes | Standard | 12 | No |
| P10078 | 67 | F | Heart Disease | Intensive | 18 | Yes |
| P10092 | 32 | F | Pneumonia | Standard | 7 | No |
| P10105 | 58 | M | Heart Disease | Standard | 21 | Yes |
| P10123 | 39 | M | Diabetes | Intensive | 10 | No |

**Étape actuelle :** Exploration des données. Quelles colonnes allez-vous examiner en priorité ?`;
  };

  // Générer le scénario Logistique
  const generateLogistiqueScenario = () => {
    return `# Mission Data Analytics - Logistique

Vous êtes Data Analyst pour EuroFreight, une entreprise de transport et logistique européenne.

**Contexte :** La direction constate une augmentation des retards de livraison qui affecte la satisfaction client. Elle souhaite comprendre les causes de ces retards pour mettre en place des mesures correctives.

**Données disponibles :** Vous disposez des données de livraison des 3 derniers mois (extrait ci-dessous).

**Votre objectif :** Analyser ces données pour identifier les patterns et facteurs influençant les retards et proposer des recommandations pour améliorer la ponctualité des livraisons.

Voici un extrait des données de livraison :

| shipment_id | origin | destination | weight_kg | transport_type | planned_days | actual_days | delay_reason |
|-------------|--------|-------------|-----------|----------------|--------------|-------------|--------------|
| SH10056 | Paris | Berlin | 450 | Road | 2 | 3 | Weather |
| SH10078 | Madrid | Lisbon | 320 | Road | 1 | 1 | null |
| SH10092 | Berlin | Warsaw | 580 | Rail | 3 | 5 | Customs |
| SH10105 | Rome | Paris | 290 | Air | 1 | 2 | Technical |
| SH10123 | London | Edinburgh | 410 | Road | 1 | 1 | null |

**Étape actuelle :** Exploration des données. Quelles colonnes allez-vous examiner en priorité ?`;
  };

  // Générer les options d'exploration en fonction du scénario
  const generateExplorationOptions = (scenarioId: string) => {
    if (scenarioId.includes('ecommerce')) {
      return [
        { 
          id: 'explore_ecom_1', 
          text: 'Je vais d\'abord analyser la relation entre price, product_category et le taux d\'abandon',
          isCorrect: true,
          points: 15,
          feedback: "Excellent choix ! Ces variables sont cruciales pour comprendre si certaines catégories de produits ou gammes de prix sont plus susceptibles d'être abandonnées."
        },
        { 
          id: 'explore_ecom_2', 
          text: 'Je me concentre sur payment_method et son impact possible sur l\'abandon du panier',
          isCorrect: true,
          points: 10,
          feedback: "Bonne idée ! La méthode de paiement peut être un facteur important d'abandon si certaines options posent problème."
        },
        { 
          id: 'explore_ecom_3', 
          text: 'Je vais analyser d\'abord la date de la transaction pour voir s\'il y a des tendances temporelles',
          isCorrect: false,
          points: 5,
          feedback: "C'est pertinent mais pas prioritaire. Les tendances temporelles peuvent être utiles mais n'expliquent pas directement le comportement d'abandon."
        },
        { 
          id: 'explore_ecom_4', 
          text: 'Je m\'intéresse surtout aux customer_id pour retrouver les clients récurrents',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la priorité ici. Bien que l'analyse des clients récurrents puisse être intéressante, elle ne répond pas directement à la question sur les causes d'abandon."
        }
      ];
    } else if (scenarioId.includes('ong')) {
      return [
        { 
          id: 'explore_ong_1', 
          text: 'Je vais analyser le rapport entre cost_usd, aid_type et success_rating pour évaluer l\'efficacité des dépenses',
          isCorrect: true,
          points: 15,
          feedback: "Excellent choix ! Ces variables sont parfaites pour comprendre le retour sur investissement par type d'aide."
        },
        { 
          id: 'explore_ong_2', 
          text: 'Je m\'intéresse d\'abord à la présence de local_partner et son effet sur success_rating',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! La présence de partenaires locaux peut être un facteur déterminant dans le succès des interventions."
        },
        { 
          id: 'explore_ong_3', 
          text: 'Je regarde d\'abord la distribution géographique et temporelle des interventions',
          isCorrect: false,
          points: 5,
          feedback: "C'est pertinent mais pas prioritaire pour l'efficacité des programmes. Ces facteurs sont importants pour la planification mais pas pour évaluer l'efficacité."
        },
        { 
          id: 'explore_ong_4', 
          text: 'Je me concentre sur le nombre de bénéficiaires uniquement',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas suffisant. Le nombre de bénéficiaires seul ne permet pas d'évaluer l'efficacité sans le mettre en relation avec les coûts et les résultats."
        }
      ];
    } else if (scenarioId.includes('sante')) {
      return [
        { 
          id: 'explore_sante_1', 
          text: 'Je vais étudier la relation entre condition, treatment et readmission',
          isCorrect: true,
          points: 15,
          feedback: "Excellent choix ! Ces variables sont essentielles pour comprendre si certains traitements sont plus efficaces que d'autres selon les pathologies."
        },
        { 
          id: 'explore_sante_2', 
          text: 'Je vais examiner la relation entre age, gender et readmission',
          isCorrect: true,
          points: 10,
          feedback: "Bonne approche ! Les facteurs démographiques peuvent avoir un impact significatif sur les risques de réadmission."
        },
        { 
          id: 'explore_sante_3', 
          text: 'Je me concentre sur days_to_recovery comme indicateur principal',
          isCorrect: false,
          points: 5,
          feedback: "Cette variable est pertinente mais insuffisante seule. La durée de récupération doit être analysée en relation avec d'autres facteurs."
        },
        { 
          id: 'explore_sante_4', 
          text: 'Je vais d\'abord identifier les patient_id qui reviennent le plus souvent',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la bonne approche. L'identification des patients individuels ne nous aide pas à comprendre les facteurs systémiques de réadmission."
        }
      ];
    } else {
      // Logistique
      return [
        { 
          id: 'explore_log_1', 
          text: 'Je vais analyser la relation entre transport_type, planned_days et actual_days',
          isCorrect: true,
          points: 15,
          feedback: "Excellent choix ! Ces variables sont cruciales pour comprendre quels modes de transport respectent leurs délais prévus."
        },
        { 
          id: 'explore_log_2', 
          text: 'Je m\'intéresse d\'abord à delay_reason pour comprendre les causes des retards',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! Comprendre les causes des retards est essentiel pour proposer des solutions appropriées."
        },
        { 
          id: 'explore_log_3', 
          text: 'Je vais étudier les routes (origin-destination) ayant le plus de retards',
          isCorrect: false,
          points: 5,
          feedback: "C'est pertinent mais pas prioritaire. Les routes spécifiques sont importantes, mais il vaut mieux d'abord comprendre les facteurs systémiques."
        },
        { 
          id: 'explore_log_4', 
          text: 'Je me concentre sur weight_kg pour voir si le poids affecte les délais',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la priorité. Bien que le poids puisse jouer un rôle, d'autres facteurs sont probablement plus déterminants pour les retards."
        }
      ];
    }
  };

  // Générer le feedback d'exploration basé sur l'option sélectionnée
  const generateExplorationFeedback = (optionId: string) => {
    // Retrouver l'option sélectionnée pour obtenir son feedback
    const selectedOption = options.find(opt => opt.id === optionId);
    
    let baseContent = `# Résultats de l'exploration

${selectedOption?.feedback || "J'ai exploré les données comme vous l'avez suggéré."}

Après une analyse approfondie, voici ce que j'ai découvert :

1. **Patterns importants** : Des corrélations significatives apparaissent dans les données.
2. **Segments distincts** : Plusieurs groupes avec des comportements différents se dégagent.
3. **Valeurs aberrantes** : J'ai identifié quelques anomalies qui méritent une attention particulière.

### Quelle analyse souhaitez-vous maintenant réaliser pour approfondir cette exploration ?`;

    return baseContent;
  };

  // Générer les options d'analyse en fonction du scénario
  const generateAnalysisOptions = (scenarioType: string) => {
    if (scenarioType === 'ecommerce') {
      return [
        { 
          id: 'analyze_ecom_1', 
          text: 'Je vais calculer le taux d\'abandon par catégorie de produit et gamme de prix',
          isCorrect: true,
          points: 15,
          feedback: "Excellente analyse ! Cette approche permet d'identifier précisément quels types de produits et quelles gammes de prix posent problème."
        },
        { 
          id: 'analyze_ecom_2', 
          text: 'Je vais comparer les taux d\'abandon entre les différentes méthodes de paiement',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! Cette analyse peut révéler si certaines méthodes de paiement sont des freins à la conversion."
        },
        { 
          id: 'analyze_ecom_3', 
          text: 'Je vais créer un modèle prédictif pour identifier les facteurs d\'abandon',
          isCorrect: false,
          points: 5,
          feedback: "C'est une approche avancée, mais peut-être prématurée. Mieux vaut d'abord établir des corrélations claires avant de passer à la modélisation."
        },
        { 
          id: 'analyze_ecom_4', 
          text: 'Je vais analyser les habitudes d\'achat de chaque client pour créer des profils',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la priorité. La création de profils clients est utile pour la personnalisation, mais ne répond pas directement à la question sur l'abandon de panier."
        }
      ];
    } else if (scenarioType === 'ong') {
      return [
        { 
          id: 'analyze_ong_1', 
          text: 'Je vais calculer le ratio coût/bénéficiaire par type d\'aide et région',
          isCorrect: true,
          points: 15,
          feedback: "Excellente analyse ! Cette approche permet d'identifier l'efficience des différents types d'interventions selon les contextes régionaux."
        },
        { 
          id: 'analyze_ong_2', 
          text: 'Je vais comparer les success_rating avec et sans partenaires locaux',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! Cette comparaison peut révéler l'importance des partenariats locaux dans le succès des programmes."
        },
        { 
          id: 'analyze_ong_3', 
          text: 'Je vais analyser les tendances temporelles des interventions',
          isCorrect: false,
          points: 5,
          feedback: "Cette analyse est intéressante mais pas prioritaire pour évaluer l'efficacité des programmes. Elle serait plus utile pour la planification future."
        },
        { 
          id: 'analyze_ong_4', 
          text: 'Je vais créer une visualisation de la répartition géographique des interventions',
          isCorrect: false,
          points: 0,
          feedback: "Cette approche n'est pas la plus pertinente pour répondre à la question de l'efficacité. Une carte est utile pour la communication mais n'apporte pas d'insights sur l'efficacité des programmes."
        }
      ];
    } else if (scenarioType === 'sante') {
      return [
        { 
          id: 'analyze_sante_1', 
          text: 'Je vais calculer le taux de réadmission par condition et type de traitement',
          isCorrect: true,
          points: 15,
          feedback: "Excellente analyse ! Cette approche permet d'identifier quels traitements sont les plus efficaces pour chaque pathologie."
        },
        { 
          id: 'analyze_sante_2', 
          text: 'Je vais stratifier les données par âge et sexe pour identifier les groupes à risque',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! Cette stratification peut révéler des populations plus vulnérables nécessitant une attention particulière."
        },
        { 
          id: 'analyze_sante_3', 
          text: 'Je vais calculer la durée moyenne de récupération pour chaque condition',
          isCorrect: false,
          points: 5,
          feedback: "Cette analyse est pertinente mais insuffisante seule pour comprendre les réadmissions. La durée de récupération n'est qu'un des facteurs à considérer."
        },
        { 
          id: 'analyze_sante_4', 
          text: 'Je vais analyser les tendances temporelles des admissions',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la priorité. Les tendances temporelles n'expliquent pas directement les causes de réadmission, qui est l'objectif principal de l'analyse."
        }
      ];
    } else {
      // Logistique
      return [
        { 
          id: 'analyze_log_1', 
          text: 'Je vais calculer le taux de retard par type de transport et analyser les raisons',
          isCorrect: true,
          points: 15,
          feedback: "Excellente analyse ! Cette approche permet d'identifier les modes de transport les plus problématiques et leurs causes spécifiques de retard."
        },
        { 
          id: 'analyze_log_2', 
          text: 'Je vais créer une matrice des délais moyens par route et mode de transport',
          isCorrect: true,
          points: 10,
          feedback: "Très bonne approche ! Cette matrice peut révéler les combinaisons route-transport les plus efficaces et celles qui posent problème."
        },
        { 
          id: 'analyze_log_3', 
          text: 'Je vais analyser la corrélation entre poids et retard pour chaque mode de transport',
          isCorrect: false,
          points: 5,
          feedback: "Cette analyse est intéressante mais probablement secondaire. Le poids peut jouer un rôle, mais d'autres facteurs sont généralement plus déterminants."
        },
        { 
          id: 'analyze_log_4', 
          text: 'Je vais analyser les tendances temporelles des retards',
          isCorrect: false,
          points: 0,
          feedback: "Ce n'est pas la priorité. Les tendances temporelles peuvent être utiles pour la planification saisonnière, mais n'identifient pas les causes structurelles des retards."
        }
      ];
    }
  };

  // Générer le feedback d'analyse basé sur l'option sélectionnée
  const generateAnalysisFeedback = (optionId: string) => {
    // Retrouver l'option sélectionnée pour obtenir son feedback
    const selectedOption = options.find(opt => opt.id === optionId);
    
    let baseContent = `# Résultats de l'analyse

${selectedOption?.feedback || "J'ai effectué l'analyse que vous avez demandée."}

Voici les résultats clés que j'ai obtenus :

1. **Corrélations significatives** (p-value < 0.01) entre les variables analysées.
2. **Segments identifiés** : Trois groupes distincts avec des comportements très différents.
3. **Anomalies caractérisées** : Les valeurs aberrantes suivent un pattern identifiable.

### Sur base de ces analyses, quelle recommandation formuleriez-vous pour répondre à l'objectif initial ?`;

    return baseContent;
  };

  // Générer les options de recommandation en fonction du scénario
  const generateRecommendationOptions = (scenarioType: string) => {
    if (scenarioType === 'ecommerce') {
      return [
        { 
          id: 'recommend_ecom_1', 
          text: 'Simplifier le processus de paiement pour les articles à prix élevé et offrir des garanties supplémentaires',
          isCorrect: true,
          points: 20,
          feedback: "Excellente recommandation ! Cibler le processus de paiement pour les articles coûteux est très pertinent, car c'est souvent là que l'hésitation est la plus forte."
        },
        { 
          id: 'recommend_ecom_2', 
          text: 'Implémenter des offres promotionnelles ciblées sur les catégories à fort taux d\'abandon',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne recommandation ! Les promotions ciblées peuvent effectivement aider à franchir le cap pour les catégories qui posent problème."
        },
        { 
          id: 'recommend_ecom_3', 
          text: 'Refondre complètement l\'interface du site pour la rendre plus attrayante',
          isCorrect: false,
          points: 5,
          feedback: "Cette recommandation n'est pas directement liée aux données analysées. Une refonte complète est coûteuse et sans garantie d'impact sur le problème spécifique d'abandon."
        },
        { 
          id: 'recommend_ecom_4', 
          text: 'Augmenter le budget marketing global pour attirer plus de clients',
          isCorrect: false,
          points: 0,
          feedback: "Cette recommandation ne répond pas au problème. Attirer plus de clients ne résout pas le problème d'abandon de panier des clients existants."
        }
      ];
    } else if (scenarioType === 'ong') {
      return [
        { 
          id: 'recommend_ong_1', 
          text: 'Privilégier les partenariats locaux dans toutes les régions et types d\'intervention',
          isCorrect: true,
          points: 20,
          feedback: "Excellente recommandation ! Les données montrent clairement que les partenariats locaux améliorent significativement l'efficacité des programmes."
        },
        { 
          id: 'recommend_ong_2', 
          text: 'Réallouer les ressources vers les types d\'aide montrant le meilleur rapport coût/impact',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne recommandation ! L'optimisation de l'allocation des ressources en fonction du retour sur investissement est tout à fait pertinente."
        },
        { 
          id: 'recommend_ong_3', 
          text: 'Étendre géographiquement les interventions pour couvrir plus de régions',
          isCorrect: false,
          points: 5,
          feedback: "Cette recommandation n'est pas alignée avec l'objectif d'optimisation des ressources. L'extension géographique risque au contraire de diluer l'impact."
        },
        { 
          id: 'recommend_ong_4', 
          text: 'Investir dans une campagne de collecte de fonds pour augmenter le budget global',
          isCorrect: false,
          points: 0,
          feedback: "Cette recommandation ne répond pas au problème d'efficacité des programmes existants. Avoir plus de fonds ne garantit pas une meilleure efficacité."
        }
      ];
    } else if (scenarioType === 'sante') {
      return [
        { 
          id: 'recommend_sante_1', 
          text: 'Adapter les protocoles de traitement en fonction de l\'âge et des comorbidités pour les maladies chroniques',
          isCorrect: true,
          points: 20,
          feedback: "Excellente recommandation ! La personnalisation des protocoles en fonction des facteurs de risque identifiés est parfaitement alignée avec les données."
        },
        { 
          id: 'recommend_sante_2', 
          text: 'Mettre en place un suivi post-hospitalisation plus rigoureux pour les patients à haut risque',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne recommandation ! Le suivi post-hospitalisation est crucial pour prévenir les réadmissions, particulièrement pour les groupes à risque identifiés."
        },
        { 
          id: 'recommend_sante_3', 
          text: 'Former davantage le personnel médical aux nouvelles techniques de soins',
          isCorrect: false,
          points: 5,
          feedback: "Cette recommandation, bien que généralement utile, n'est pas directement liée aux facteurs de réadmission identifiés dans l'analyse."
        },
        { 
          id: 'recommend_sante_4', 
          text: 'Investir dans de nouveaux équipements médicaux',
          isCorrect: false,
          points: 0,
          feedback: "Cette recommandation ne répond pas au problème identifié. Rien dans l'analyse ne suggère que l'équipement est un facteur de réadmission."
        }
      ];
    } else {
      // Logistique
      return [
        { 
          id: 'recommend_log_1', 
          text: 'Revoir les procédures douanières pour les expéditions ferroviaires et développer des relations avec les autorités concernées',
          isCorrect: true,
          points: 20,
          feedback: "Excellente recommandation ! Les problèmes douaniers sont clairement identifiés comme une cause majeure de retard pour le transport ferroviaire."
        },
        { 
          id: 'recommend_log_2', 
          text: 'Implémenter un système de prévision météorologique intégré à la planification des routes routières',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne recommandation ! La météo étant une cause importante de retard pour le transport routier, cette mesure préventive est tout à fait pertinente."
        },
        { 
          id: 'recommend_log_3', 
          text: 'Changer tous les fournisseurs de transport actuels',
          isCorrect: false,
          points: 5,
          feedback: "Cette recommandation est excessive et ne cible pas les problèmes spécifiques identifiés. Changer tous les fournisseurs serait coûteux et perturbateur."
        },
        { 
          id: 'recommend_log_4', 
          text: 'Allonger tous les délais de livraison prévus pour éviter les retards',
          isCorrect: false,
          points: 0,
          feedback: "Cette recommandation ne résout pas le problème réel. Allonger artificiellement les délais masque le problème au lieu de l'adresser et risque d'affecter la satisfaction client."
        }
      ];
    }
  };

  // Générer le feedback de recommandation basé sur l'option sélectionnée
  const generateRecommendationFeedback = (optionId: string) => {
    // Retrouver l'option sélectionnée pour obtenir son feedback
    const selectedOption = options.find(opt => opt.id === optionId);
    
    let baseContent = `# Évaluation de la recommandation

${selectedOption?.feedback || "Votre recommandation a été évaluée."}

Maintenant que vous avez formulé votre recommandation principale, vous devez la présenter à la direction. 

**Situation** : Vous avez 2 minutes avec le directeur/la directrice. Cette personne n'a pas de background technique et a besoin d'une explication claire et convaincante.

### Comment structureriez-vous votre présentation pour maximiser l'impact de votre recommandation ?`;

    return baseContent;
  };

  // Générer les options de présentation en fonction du scénario
  const generatePresentationOptions = (scenarioType: string) => {
    if (scenarioType === 'ecommerce') {
      return [
        { 
          id: 'present_ecom_1', 
          text: 'Je commencerai par le problème business (chiffres d\'abandon), puis présenterai les insights clés et mes recommandations avec l\'impact financier estimé',
          isCorrect: true,
          points: 20,
          feedback: "Excellente approche ! Commencer par l'impact business, poursuivre avec les insights et terminer avec des recommandations concrètes et chiffrées est parfait pour un directeur marketing."
        },
        { 
          id: 'present_ecom_2', 
          text: 'J\'utiliserai des visualisations simples montrant les taux d\'abandon par catégorie et mode de paiement pour justifier mes recommandations',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne approche ! Les visualisations aident à communiquer efficacement les insights complexes à un public non technique."
        },
        { 
          id: 'present_ecom_3', 
          text: 'Je présenterai en détail la méthodologie d\'analyse et les tests statistiques utilisés',
          isCorrect: false,
          points: 5,
          feedback: "Cette approche est trop technique pour une présentation à un directeur marketing pressé. Les détails méthodologiques risquent de détourner l'attention des recommandations."
        },
        { 
          id: 'present_ecom_4', 
          text: 'Je proposerai une refonte complète de la stratégie marketing sans entrer dans les détails des données',
          isCorrect: false,
          points: 0,
          feedback: "Cette approche n'est pas appropriée. Sans appuyer vos recommandations sur les données analysées, vous risquez de perdre en crédibilité."
        }
      ];
    } else if (scenarioType === 'ong') {
      return [
        { 
          id: 'present_ong_1', 
          text: 'Je présenterai les métriques d\'efficacité par type d\'intervention et région, puis mes recommandations avec les gains d\'efficience attendus',
          isCorrect: true,
          points: 20,
          feedback: "Excellente approche ! Présenter des métriques claires d'efficacité suivies de recommandations chiffrées est parfait pour convaincre un conseil d'administration."
        },
        { 
          id: 'present_ong_2', 
          text: 'J\'utiliserai des exemples concrets de succès et d\'échecs pour illustrer l\'impact des partenariats locaux',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne approche ! Les exemples concrets et les histoires permettent de rendre les données plus engageantes et mémorables."
        },
        { 
          id: 'present_ong_3', 
          text: 'Je me concentrerai sur les aspects techniques de l\'analyse statistique',
          isCorrect: false,
          points: 5,
          feedback: "Cette approche est trop technique pour un conseil d'administration. Les détails statistiques risquent de détourner l'attention des recommandations concrètes."
        },
        { 
          id: 'present_ong_4', 
          text: 'Je proposerai une réorientation complète de la mission de l\'ONG en fonction des tendances humanitaires actuelles',
          isCorrect: false,
          points: 0,
          feedback: "Cette approche dépasse largement le cadre de l'analyse et n'est pas appropriée. Proposer un changement de mission n'est pas soutenu par les données analysées."
        }
      ];
    } else if (scenarioType === 'sante') {
      return [
        { 
          id: 'present_sante_1', 
          text: 'Je présenterai les taux de réadmission par groupe de patients et protocole, puis mes recommandations avec l\'impact attendu sur les réadmissions et les coûts',
          isCorrect: true,
          points: 20,
          feedback: "Excellente approche ! Commencer par les données clés sur les réadmissions et terminer avec des recommandations liées aux coûts est parfait pour un directeur médical."
        },
        { 
          id: 'present_sante_2', 
          text: 'J\'utiliserai des cas patients anonymisés comme exemples pour illustrer les facteurs de risque et les opportunités d\'amélioration',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne approche ! Les exemples concrets aident à humaniser les données et à rendre les recommandations plus tangibles pour les professionnels de santé."
        },
        { 
          id: 'present_sante_3', 
          text: 'Je me concentrerai sur les aspects techniques des analyses statistiques réalisées',
          isCorrect: false,
          points: 5,
          feedback: "Cette approche est trop technique même pour un directeur médical dont l'intérêt principal est l'amélioration des résultats cliniques, pas les détails statistiques."
        },
        { 
          id: 'present_sante_4', 
          text: 'Je proposerai des solutions technologiques avancées sans me référer aux données analysées',
          isCorrect: false,
          points: 0,
          feedback: "Cette approche n'est pas appropriée. Sans lier vos recommandations aux données analysées, vous manquerez de crédibilité auprès du directeur médical."
        }
      ];
    } else {
      // Logistique
      return [
        { 
          id: 'present_log_1', 
          text: 'Je présenterai les données sur les retards par type de transport et cause, puis mes recommandations avec l\'impact attendu sur la ponctualité et la satisfaction client',
          isCorrect: true,
          points: 20,
          feedback: "Excellente approche ! Présenter d'abord les données clés sur les retards puis des recommandations avec leur impact attendu est parfait pour convaincre la direction."
        },
        { 
          id: 'present_log_2', 
          text: 'J\'utiliserai des exemples concrets de retards coûteux et leurs causes pour illustrer les problèmes et solutions',
          isCorrect: true,
          points: 15,
          feedback: "Très bonne approche ! Les exemples concrets rendent les données plus engageantes et démontrent l'impact business réel des problèmes identifiés."
        },
        { 
          id: 'present_log_3', 
          text: 'Je me concentrerai sur les détails techniques des analyses statistiques réalisées',
          isCorrect: false,
          points: 5,
          feedback: "Cette approche est trop technique pour une direction dont l'intérêt principal est l'impact sur les opérations et la satisfaction client, pas les détails statistiques."
        },
        { 
          id: 'present_log_4', 
          text: 'Je suggérerai une refonte complète de la chaîne logistique sans me référer aux données spécifiques',
          isCorrect: false,
          points: 0,
          feedback: "Cette approche n'est pas appropriée. Suggérer un changement aussi radical sans le justifier par des données précises manque de crédibilité et risque d'être rejeté."
        }
      ];
    }
  };

  // Générer le feedback de présentation basé sur l'option sélectionnée
  const generatePresentationFeedback = (optionId: string) => {
    // Retrouver l'option sélectionnée pour obtenir son feedback
    const selectedOption = options.find(opt => opt.id === optionId);
    
    let baseContent = `# Réaction du directeur

${selectedOption?.feedback || "Votre approche de présentation a été évaluée."}

**Le directeur vous écoute attentivement et répond :**

"Merci pour cette présentation claire. Votre analyse est convaincante et vos recommandations semblent pertinentes.

J'ai cependant trois questions :

1. Quel niveau de confiance avez-vous dans ces conclusions ? Les données sont-elles suffisantes ?
2. Quel serait le coût de mise en œuvre de vos recommandations comparé aux bénéfices attendus ?
3. Combien de temps faudrait-il pour voir des résultats concrets ?

**Veuillez consulter vos résultats finaux pour évaluer votre performance dans cette simulation.**`;

    return baseContent;
  };

  // Générer le feedback final basé sur le score
  const generateFinalFeedback = (score: number, scenarioType: string) => {
    let feedbackQuality = "";
    
    if (score >= 85) {
      feedbackQuality = "excellente";
    } else if (score >= 70) {
      feedbackQuality = "très bonne";
    } else if (score >= 50) {
      feedbackQuality = "satisfaisante";
    } else {
      feedbackQuality = "à améliorer";
    }
    
    return `# Évaluation finale

## Performance : ${feedbackQuality.toUpperCase()}

Vous avez terminé cette simulation de mission data avec un score de **${score}/100**.

### Points forts :
${score >= 70 ? 
"- ✓ Bonne compréhension des données et du contexte métier\n- ✓ Choix pertinent des variables à analyser\n- ✓ Recommandations alignées avec les objectifs business\n- ✓ Communication adaptée à un public non-technique" : 
"- ✓ Bonne volonté d'exploration des données\n- ✓ Tentative d'aligner les analyses avec le contexte métier"}

### Axes d'amélioration :
${score >= 70 ?
"- Quantifier davantage l'impact business attendu\n- Anticiper les questions de la direction\n- Envisager plusieurs scénarios dans vos recommandations" :
"- Mieux identifier les variables pertinentes pour l'analyse\n- Formuler des recommandations plus directement liées aux données\n- Adapter votre communication à votre audience"}

### Compétences développées :
- Analyse exploratoire de données
- Formulation de recommandations basées sur les données
- Communication de résultats techniques à un public non-technique
- Prise de décision dans un contexte d'entreprise

Souhaitez-vous tenter un autre scénario pour continuer à développer vos compétences ?`;
  };

  // Effet pour dérouler la conversation jusqu'au dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Lancer une nouvelle session au montage du composant
  useEffect(() => {
    startNewSession();
  }, []);

  // Formatter les messages Markdown
  const formatContent = (content: string) => {
    // Remplacer les titres
    content = content.replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold text-white mb-2 mt-3">$1</h2>');
    content = content.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold text-white mb-2 mt-3">$1</h3>');
    content = content.replace(/^### (.*$)/gm, '<h4 class="text-md font-semibold text-white mb-2 mt-3">$1</h4>');
    
    // Remplacer les listes à puces
    content = content.replace(/^\* (.*$)/gm, '<li>• $1</li>');
    content = content.replace(/^- (.*$)/gm, '<li>• $1</li>');
    
    // Mettre en forme les tableaux (basique)
    if (content.includes('|')) {
      const tableLines = content.split('\n').filter(line => line.includes('|'));
      if (tableLines.length > 2) {
        const tableHTML = '<div class="overflow-auto max-w-full my-4"><table class="min-w-full border border-blue-700/30">' +
          tableLines.map((line, i) => {
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            
            // Ignorer les lignes de séparation (ex: |------|------|)
            if (line.trim().replace(/\|/g, '').replace(/-/g, '').replace(/:/g, '').trim() === '') {
              return '';
            }
            
            const isHeader = i === 0;
            const cellTag = isHeader ? 'th' : 'td';
            const cellClass = isHeader 
              ? 'bg-blue-900/40 text-white font-medium px-3 py-2 text-left text-sm' 
              : 'px-3 py-2 text-sm text-gray-200 border-t border-blue-700/20';
            
            return '<tr>' + cells.map(cell => `<${cellTag} class="${cellClass}">${cell.trim()}</${cellTag}>`).join('') + '</tr>';
          }).join('') + 
          '</table></div>';
          
        content = content.replace(/(\|.*\|\n)+/g, tableHTML);
      }
    }
    
    // Mettre en gras
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Mettre en italique
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Ajouter des paragraphes
    content = content.split('\n\n').map(paragraph => {
      if (!paragraph.includes('<h2') && !paragraph.includes('<h3') && !paragraph.includes('<h4') && !paragraph.includes('<li') && !paragraph.includes('<table')) {
        return `<p class="mb-3">${paragraph}</p>`;
      }
      return paragraph;
    }).join('');
    
    // Envelopper les listes
    content = content.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)+/g, match => {
      return `<ul class="list-disc pl-5 mb-4 space-y-1">${match}</ul>`;
    });
    
    return content;
  };

  // Rendre le composant
  return (
    <div className={`min-h-screen ${highContrastMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-900 to-blue-950'}`}>
      <header className="py-6 border-b border-blue-700/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/data-ia')}
                className="text-white hover:text-blue-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-white ml-4 font-data-title flex items-center">
                <Database className="mr-2 h-6 w-6 text-cyan-400" />
                DATA OPS
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="contrast-mode"
                  checked={highContrastMode}
                  onCheckedChange={setHighContrastMode}
                />
                <Label htmlFor="contrast-mode" className="text-white text-sm">Mode contraste élevé</Label>
              </div>
              
              <Badge className={`${
                currentStage === 'complete' ? "bg-blue-600" : "bg-green-600"
              }`}>
                {currentStage === 'introduction' && 'Introduction'}
                {currentStage === 'exploration' && 'Exploration des données'}
                {currentStage === 'analysis' && 'Analyse'}
                {currentStage === 'recommendation' && 'Recommandation'}
                {currentStage === 'presentation' && 'Présentation'}
                {currentStage === 'feedback' && 'Feedback'}
                {currentStage === 'complete' && 'Session terminée'}
              </Badge>
              
              {session?.score !== undefined && (
                <Badge className="bg-amber-600">
                  Score: {session.score}/100
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Interface de Simulation */}
          <Card className={`${
            highContrastMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/30'
          }`}>
            <CardContent className="p-0">
              <div className="flex flex-col min-h-[600px]">
                {/* Zone de messages */}
                <div className="flex-1 overflow-y-auto p-4 pb-24">
                  {messages.map((message, index) => (
                    <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                      <div className={`max-w-3xl rounded-lg p-4 ${
                        message.role === 'user'
                          ? highContrastMode 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-blue-600/70 text-white'
                          : highContrastMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-indigo-900/70 text-white'
                      }`}>
                        {message.role === 'assistant' && (
                          <div className="flex items-center mb-2">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src="/icons/data-ops-avatar.png" />
                              <AvatarFallback className="bg-cyan-800">
                                <Database className="h-4 w-4 text-cyan-300" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-gray-200">DATA OPS</span>
                            {message.type && (
                              <Badge className="ml-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30">
                                {message.type === 'introduction' && 'Briefing'}
                                {message.type === 'exploration' && 'Exploration'}
                                {message.type === 'analysis' && 'Analyse'}
                                {message.type === 'recommendation' && 'Recommandation'}
                                {message.type === 'presentation' && 'Présentation'}
                                {message.type === 'feedback' && 'Feedback'}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div 
                            className="prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Zone de choix QCM */}
                <div className={`border-t ${
                  highContrastMode 
                    ? 'border-gray-700 bg-gray-800/90' 
                    : 'border-blue-800/50 bg-indigo-900/80'
                  } p-6 absolute bottom-0 left-0 right-0 backdrop-blur-sm`}
                >
                  {options.length > 0 && (
                    <div className="space-y-4">
                      <RadioGroup
                        value={selectedOption || ''}
                        onValueChange={setSelectedOption}
                        className="space-y-2"
                      >
                        {options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-start space-x-3 p-3 rounded-md ${
                              selectedOption === option.id
                                ? highContrastMode
                                  ? 'bg-blue-700/70 border border-blue-500'
                                  : 'bg-blue-800/70 border border-blue-500/80'
                                : highContrastMode
                                  ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                                  : 'bg-blue-900/50 border border-blue-800/50 hover:bg-blue-800/40'
                            } transition-colors cursor-pointer`}
                            onClick={() => setSelectedOption(option.id)}
                          >
                            <RadioGroupItem
                              value={option.id}
                              id={`option-${option.id}`}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`option-${option.id}`}
                              className="text-sm flex-grow text-gray-200 cursor-pointer"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      <div className="flex justify-end">
                        <Button
                          onClick={submitChoice}
                          disabled={isLoading || !selectedOption}
                          className={`${
                            highContrastMode 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                          } text-white px-6`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Valider ce choix
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Carte d'instructions */}
          <Card className={`mt-6 ${
            highContrastMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700/20'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center text-lg">
                <HelpCircle className="mr-2 h-5 w-5 text-cyan-400" />
                Guide de simulation DATA OPS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className={`p-3 rounded-md ${
                  highContrastMode 
                    ? 'bg-gray-700/50' 
                    : 'bg-blue-900/30'
                }`}>
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <FileBarChart className="mr-2 h-4 w-4 text-blue-400" />
                    Exploration
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Identifiez les données pertinentes pour répondre à la question business. Quelles colonnes examiner et pourquoi ?
                  </p>
                </div>
                
                <div className={`p-3 rounded-md ${
                  highContrastMode 
                    ? 'bg-gray-700/50' 
                    : 'bg-blue-900/30'
                }`}>
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-purple-400" />
                    Analyse
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Choisissez les bonnes méthodes d'analyse pour extraire des insights pertinents des données explorées.
                  </p>
                </div>
                
                <div className={`p-3 rounded-md ${
                  highContrastMode 
                    ? 'bg-gray-700/50' 
                    : 'bg-blue-900/30'
                }`}>
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
                    Recommandation
                  </h3>
                  <p className="text-gray-300 text-xs">
                    Formulez des recommandations business basées sur vos analyses. Comment transformer les insights en actions ?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DataOpsSimulation;