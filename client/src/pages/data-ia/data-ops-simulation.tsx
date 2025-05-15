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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Database,
  Send,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sparkles,
  BarChart,
  LineChart,
  PieChart,
  Brain,
  FileText,
  MessageSquare,
  User,
  ChevronsDown,
  Timer,
  Loader2,
  Settings,
  HelpCircle,
  LayoutGrid,
  Star,
  ClipboardList
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { io, Socket } from 'socket.io-client';

// Définir les étapes possibles pour une session Data OPS
type DataOpsStage = 'introduction' | 'exploration' | 'analysis' | 'recommendation' | 'presentation' | 'feedback' | 'complete';

interface DataOpsMessage {
  id: string;
  role: 'assistant' | 'user' | 'system' | 'function';
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
}

interface DataTableDisplay {
  columns: string[];
  rows: Record<string, any>[];
}

const DataOpsSimulation = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [session, setSession] = useState<DataOpsSession | null>(null);
  const [messages, setMessages] = useState<DataOpsMessage[]>([]);
  const [currentStage, setCurrentStage] = useState<DataOpsStage>('introduction');
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // Simuler le début d'une nouvelle session
  const startNewSession = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un appel à l'API pour démarrer une nouvelle session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const introMessage: DataOpsMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `# Bienvenue dans DATA OPS !

Je suis votre animateur pour cette simulation de mission data.

Dans quelques instants, vous allez incarner un analyste data confronté à une mission professionnelle réaliste avec :

- Un contexte métier (entreprise, ONG, santé...)
- Des données à explorer et analyser
- Des interlocuteurs qui attendront vos recommandations

Êtes-vous prêt(e) à commencer une simulation ? Dites simplement "Commencer" ou "Donne-moi un cas" pour lancer le jeu.`,
        timestamp: Date.now(),
        type: 'introduction'
      };
      
      const newSession: DataOpsSession = {
        id: Date.now().toString(),
        scenario: 'En attente de démarrage',
        domain: '',
        level: 'intermédiaire',
        currentStage: 'introduction',
        messages: [introMessage],
        createdAt: Date.now()
      };
      
      setSession(newSession);
      setMessages([introMessage]);
      setCurrentStage('introduction');
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
  
  // Simuler l'envoi d'un message à l'API Azure OpenAI
  const sendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;
    
    const userMessage: DataOpsMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessageInput('');
    
    try {
      // Simuler un délai API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let responseContent = '';
      let responseType: DataOpsMessage['type'] = currentStage;
      let newStage = currentStage;
      
      // Analyser la réponse de l'utilisateur et générer une réponse appropriée
      const userContent = messageInput.toLowerCase().trim();
      
      if (currentStage === 'introduction') {
        if (userContent.includes('commencer') || userContent.includes('cas') || userContent.includes('prêt') || userContent.includes('oui')) {
          responseContent = generateScenario();
          responseType = 'exploration';
          newStage = 'exploration';
        } else {
          responseContent = "Dites simplement \"Commencer\" ou \"Donne-moi un cas\" quand vous êtes prêt(e) à démarrer la simulation.";
        }
      } else if (currentStage === 'exploration') {
        // Simuler une réponse à l'exploration des données
        responseContent = generateExplorationResponse(userContent);
        if (userContent.includes('analyse') || userContent.includes('croiser') || userContent.includes('tendance') || userContent.includes('corrélation')) {
          responseType = 'analysis';
          newStage = 'analysis';
        }
      } else if (currentStage === 'analysis') {
        // Simuler une réponse à l'analyse
        responseContent = generateAnalysisResponse(userContent);
        if (userContent.includes('recommand') || userContent.includes('conclu') || userContent.includes('suggère') || userContent.includes('préconise')) {
          responseType = 'recommendation';
          newStage = 'recommendation';
        }
      } else if (currentStage === 'recommendation') {
        // Simuler une réponse à la recommandation
        responseContent = generateRecommendationResponse(userContent);
        responseType = 'presentation';
        newStage = 'presentation';
      } else if (currentStage === 'presentation') {
        // Simuler une réponse à la présentation au client/directeur
        responseContent = generatePresentationResponse(userContent);
        responseType = 'feedback';
        newStage = 'feedback';
      } else if (currentStage === 'feedback') {
        // Simuler une réponse au feedback
        responseContent = `# Merci d'avoir participé à cette simulation !

Voici un récapitulatif de votre parcours :

- Vous avez correctement identifié les données clés à analyser
- Vos hypothèses étaient pertinentes et logiques
- Votre recommandation finale était bien alignée avec l'objectif métier
- Votre présentation était claire et adaptée à votre interlocuteur

**Points forts** :
- Bonne compréhension du contexte métier
- Analyse méthodique et structurée
- Capacité à formuler des recommandations concrètes

**Axes d'amélioration** :
- Pensez à mentionner les limites potentielles de votre analyse
- N'hésitez pas à proposer des pistes complémentaires à explorer

Souhaitez-vous démarrer une nouvelle simulation avec un scénario différent ?`;
        responseType = 'feedback';
        newStage = 'complete';
      } else if (currentStage === 'complete') {
        if (userContent.includes('oui') || userContent.includes('nouveau') || userContent.includes('autre')) {
          // Redémarrer avec un nouveau scénario
          setIsLoading(false);
          return startNewSession();
        } else {
          responseContent = "Si vous changez d'avis et souhaitez essayer un nouveau scénario, dites-le moi !";
        }
      }
      
      const assistantMessage: DataOpsMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now(),
        type: responseType
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStage(newStage);
      
      if (session) {
        setSession({
          ...session,
          currentStage: newStage,
          messages: [...session.messages, userMessage, assistantMessage]
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Générer un scénario de mission data
  const generateScenario = () => {
    // Générer un scénario aléatoire
    const domains = ['e-commerce', 'ONG humanitaire', 'santé', 'logistique', 'éducation', 'transport public'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    let scenario = '';
    let dataTable: DataTableDisplay = { columns: [], rows: [] };
    
    if (domain === 'e-commerce') {
      dataTable = {
        columns: ['date', 'customer_id', 'product_category', 'price', 'quantity', 'payment_method', 'delivery_time_days'],
        rows: [
          { date: '2024-04-12', customer_id: 'C1045', product_category: 'Electronics', price: 149.99, quantity: 1, payment_method: 'Credit Card', delivery_time_days: 3 },
          { date: '2024-04-12', customer_id: 'C2189', product_category: 'Clothing', price: 39.99, quantity: 2, payment_method: 'PayPal', delivery_time_days: 4 },
          { date: '2024-04-13', customer_id: 'C1045', product_category: 'Home', price: 59.99, quantity: 1, payment_method: 'Credit Card', delivery_time_days: 5 },
          { date: '2024-04-14', customer_id: 'C3267', product_category: 'Electronics', price: 299.99, quantity: 1, payment_method: 'Credit Card', delivery_time_days: 3 },
          { date: '2024-04-15', customer_id: 'C1892', product_category: 'Clothing', price: 29.99, quantity: 3, payment_method: 'PayPal', delivery_time_days: 6 }
        ]
      };
      
      scenario = `# Mission Data Analytics - E-commerce

Tu es Data Analyst chez TechMarket, une plateforme d'e-commerce qui connaît une croissance rapide mais aussi un taux d'abandon de panier préoccupant.

**Contexte :** La directrice marketing souhaite comprendre pourquoi tant de clients quittent le site sans finaliser leurs achats. Elle a besoin de recommandations concrètes pour la prochaine campagne marketing qui sera lancée dans 48h.

**Données disponibles :** Tu disposes des données de transactions des 3 derniers mois (extrait ci-dessous) ainsi que de l'historique des sessions sur le site.

**Ton objectif :** Analyser ces données pour identifier des patterns qui pourraient expliquer l'abandon et formuler 2-3 recommandations basées sur les données.

Voici un extrait des données transactions :

| date | customer_id | product_category | price | quantity | payment_method | delivery_time_days |
|------|-------------|------------------|-------|----------|----------------|-------------------|
| 2024-04-12 | C1045 | Electronics | 149.99 | 1 | Credit Card | 3 |
| 2024-04-12 | C2189 | Clothing | 39.99 | 2 | PayPal | 4 |
| 2024-04-13 | C1045 | Home | 59.99 | 1 | Credit Card | 5 |
| 2024-04-14 | C3267 | Electronics | 299.99 | 1 | Credit Card | 3 |
| 2024-04-15 | C1892 | Clothing | 29.99 | 3 | PayPal | 6 |

**Étape actuelle :** Exploration des données.  
**Question :** Quelles colonnes te semblent les plus pertinentes à examiner pour comprendre le problème d'abandon de panier, et pourquoi ?`;
    } else if (domain === 'ONG humanitaire') {
      dataTable = {
        columns: ['region', 'date', 'aid_type', 'beneficiaries', 'cost_usd', 'local_partner', 'success_rating'],
        rows: [
          { region: 'East Africa', date: '2024-03-05', aid_type: 'Food', beneficiaries: 1250, cost_usd: 15000, local_partner: 'Yes', success_rating: 4.2 },
          { region: 'South Asia', date: '2024-03-10', aid_type: 'Medical', beneficiaries: 780, cost_usd: 22000, local_partner: 'Yes', success_rating: 4.7 },
          { region: 'East Africa', date: '2024-03-15', aid_type: 'Water', beneficiaries: 2100, cost_usd: 18500, local_partner: 'No', success_rating: 3.5 },
          { region: 'West Africa', date: '2024-03-20', aid_type: 'Food', beneficiaries: 950, cost_usd: 12000, local_partner: 'Yes', success_rating: 4.0 },
          { region: 'South Asia', date: '2024-03-25', aid_type: 'Shelter', beneficiaries: 450, cost_usd: 32000, local_partner: 'No', success_rating: 3.8 }
        ]
      };
      
      scenario = `# Mission Data Analytics - ONG Humanitaire

Tu es Data Analyst pour WorldHelp, une ONG humanitaire qui intervient dans plusieurs régions du monde.

**Contexte :** Le conseil d'administration s'inquiète de l'efficacité des programmes d'aide. Les financements sont en baisse et il est crucial d'optimiser les ressources.

**Données disponibles :** Tu disposes des données des interventions des 12 derniers mois (extrait ci-dessous), incluant le type d'aide, le nombre de bénéficiaires, les coûts et l'évaluation du succès.

**Ton objectif :** Analyser ces données pour identifier les facteurs qui influencent l'efficacité des programmes et proposer des recommandations pour améliorer l'impact des interventions futures.

Voici un extrait des données d'intervention :

| region | date | aid_type | beneficiaries | cost_usd | local_partner | success_rating |
|--------|------|----------|---------------|----------|---------------|----------------|
| East Africa | 2024-03-05 | Food | 1250 | 15000 | Yes | 4.2 |
| South Asia | 2024-03-10 | Medical | 780 | 22000 | Yes | 4.7 |
| East Africa | 2024-03-15 | Water | 2100 | 18500 | No | 3.5 |
| West Africa | 2024-03-20 | Food | 950 | 12000 | Yes | 4.0 |
| South Asia | 2024-03-25 | Shelter | 450 | 32000 | No | 3.8 |

**Étape actuelle :** Exploration des données.  
**Question :** Quelles colonnes te semblent les plus pertinentes à examiner pour comprendre l'efficacité des programmes d'aide, et pourquoi ?`;
    } else if (domain === 'santé') {
      dataTable = {
        columns: ['patient_id', 'age', 'gender', 'condition', 'treatment', 'days_to_recovery', 'readmission'],
        rows: [
          { patient_id: 'P10056', age: 45, gender: 'M', condition: 'Diabetes', treatment: 'Standard', days_to_recovery: 12, readmission: 'No' },
          { patient_id: 'P10078', age: 67, gender: 'F', condition: 'Heart Disease', treatment: 'Intensive', days_to_recovery: 18, readmission: 'Yes' },
          { patient_id: 'P10092', age: 32, gender: 'F', condition: 'Pneumonia', treatment: 'Standard', days_to_recovery: 7, readmission: 'No' },
          { patient_id: 'P10105', age: 58, gender: 'M', condition: 'Heart Disease', treatment: 'Standard', days_to_recovery: 21, readmission: 'Yes' },
          { patient_id: 'P10123', age: 39, gender: 'M', condition: 'Diabetes', treatment: 'Intensive', days_to_recovery: 10, readmission: 'No' }
        ]
      };
      
      scenario = `# Mission Data Analytics - Santé

Tu es Data Analyst pour l'hôpital régional Saint-Charles qui cherche à améliorer ses protocoles de traitement.

**Contexte :** Le directeur médical s'inquiète du taux de réadmission des patients traités pour certaines pathologies chroniques. Il souhaite identifier les facteurs qui contribuent à ces réadmissions pour améliorer les protocoles.

**Données disponibles :** Tu disposes des données anonymisées de patients sur les 6 derniers mois (extrait ci-dessous), incluant leur âge, condition médicale, traitement reçu et si une réadmission a été nécessaire.

**Ton objectif :** Analyser ces données pour identifier les facteurs de risque de réadmission et proposer des pistes d'amélioration pour les protocoles de traitement.

Voici un extrait des données patients :

| patient_id | age | gender | condition | treatment | days_to_recovery | readmission |
|------------|-----|--------|-----------|-----------|------------------|-------------|
| P10056 | 45 | M | Diabetes | Standard | 12 | No |
| P10078 | 67 | F | Heart Disease | Intensive | 18 | Yes |
| P10092 | 32 | F | Pneumonia | Standard | 7 | No |
| P10105 | 58 | M | Heart Disease | Standard | 21 | Yes |
| P10123 | 39 | M | Diabetes | Intensive | 10 | No |

**Étape actuelle :** Exploration des données.  
**Question :** Quelles colonnes te semblent les plus pertinentes à examiner pour comprendre les facteurs de réadmission, et pourquoi ?`;
    } else if (domain === 'logistique') {
      dataTable = {
        columns: ['shipment_id', 'origin', 'destination', 'weight_kg', 'transport_type', 'planned_days', 'actual_days', 'delay_reason'],
        rows: [
          { shipment_id: 'SH10056', origin: 'Paris', destination: 'Berlin', weight_kg: 450, transport_type: 'Road', planned_days: 2, actual_days: 3, delay_reason: 'Weather' },
          { shipment_id: 'SH10078', origin: 'Madrid', destination: 'Lisbon', weight_kg: 320, transport_type: 'Road', planned_days: 1, actual_days: 1, delay_reason: null },
          { shipment_id: 'SH10092', origin: 'Berlin', destination: 'Warsaw', weight_kg: 580, transport_type: 'Rail', planned_days: 3, actual_days: 5, delay_reason: 'Customs' },
          { shipment_id: 'SH10105', origin: 'Rome', destination: 'Paris', weight_kg: 290, transport_type: 'Air', planned_days: 1, actual_days: 2, delay_reason: 'Technical' },
          { shipment_id: 'SH10123', origin: 'London', destination: 'Edinburgh', weight_kg: 410, transport_type: 'Road', planned_days: 1, actual_days: 1, delay_reason: null }
        ]
      };
      
      scenario = `# Mission Data Analytics - Logistique

Tu es Data Analyst pour EuroFreight, une entreprise de transport et logistique européenne.

**Contexte :** La direction constate une augmentation des retards de livraison qui affecte la satisfaction client. Elle souhaite comprendre les causes de ces retards pour mettre en place des mesures correctives.

**Données disponibles :** Tu disposes des données de livraison des 3 derniers mois (extrait ci-dessous), incluant les origines, destinations, types de transport et délais prévus vs réels.

**Ton objectif :** Analyser ces données pour identifier les patterns et facteurs influençant les retards et proposer des recommandations pour améliorer la ponctualité des livraisons.

Voici un extrait des données de livraison :

| shipment_id | origin | destination | weight_kg | transport_type | planned_days | actual_days | delay_reason |
|-------------|--------|-------------|-----------|----------------|--------------|-------------|--------------|
| SH10056 | Paris | Berlin | 450 | Road | 2 | 3 | Weather |
| SH10078 | Madrid | Lisbon | 320 | Road | 1 | 1 | null |
| SH10092 | Berlin | Warsaw | 580 | Rail | 3 | 5 | Customs |
| SH10105 | Rome | Paris | 290 | Air | 1 | 2 | Technical |
| SH10123 | London | Edinburgh | 410 | Road | 1 | 1 | null |

**Étape actuelle :** Exploration des données.  
**Question :** Quelles colonnes te semblent les plus pertinentes à examiner pour comprendre les causes des retards de livraison, et pourquoi ?`;
    } else {
      // Scénario par défaut (éducation)
      dataTable = {
        columns: ['student_id', 'age', 'course', 'attendance_rate', 'completion_time_hours', 'score', 'satisfaction'],
        rows: [
          { student_id: 'S10056', age: 23, course: 'Python Basics', attendance_rate: 0.95, completion_time_hours: 18, score: 85, satisfaction: 4.5 },
          { student_id: 'S10078', age: 35, course: 'Data Analysis', attendance_rate: 0.80, completion_time_hours: 24, score: 78, satisfaction: 4.0 },
          { student_id: 'S10092', age: 19, course: 'Python Basics', attendance_rate: 0.70, completion_time_hours: 22, score: 65, satisfaction: 3.5 },
          { student_id: 'S10105', age: 28, course: 'Web Development', attendance_rate: 0.90, completion_time_hours: 30, score: 92, satisfaction: 4.8 },
          { student_id: 'S10123', age: 31, course: 'Data Analysis', attendance_rate: 0.85, completion_time_hours: 26, score: 81, satisfaction: 4.2 }
        ]
      };
      
      scenario = `# Mission Data Analytics - Éducation

Tu es Data Analyst pour CodeLearn, une plateforme d'apprentissage en ligne spécialisée dans les cours de programmation.

**Contexte :** L'équipe pédagogique constate des taux d'abandon élevés pour certains cours et souhaite comprendre pourquoi. Le directeur des contenus a besoin de recommandations pour améliorer la rétention des étudiants.

**Données disponibles :** Tu disposes des données des étudiants sur les 6 derniers mois (extrait ci-dessous), incluant leur assiduité, temps de complétion, résultats et satisfaction.

**Ton objectif :** Analyser ces données pour identifier les facteurs qui influencent la réussite et la satisfaction des étudiants, et proposer des recommandations pour améliorer l'engagement et réduire les abandons.

Voici un extrait des données étudiants :

| student_id | age | course | attendance_rate | completion_time_hours | score | satisfaction |
|------------|-----|--------|-----------------|----------------------|-------|--------------|
| S10056 | 23 | Python Basics | 0.95 | 18 | 85 | 4.5 |
| S10078 | 35 | Data Analysis | 0.80 | 24 | 78 | 4.0 |
| S10092 | 19 | Python Basics | 0.70 | 22 | 65 | 3.5 |
| S10105 | 28 | Web Development | 0.90 | 30 | 92 | 4.8 |
| S10123 | 31 | Data Analysis | 0.85 | 26 | 81 | 4.2 |

**Étape actuelle :** Exploration des données.  
**Question :** Quelles colonnes te semblent les plus pertinentes à examiner pour comprendre les facteurs d'abandon ou de réussite des étudiants, et pourquoi ?`;
    }
    
    return scenario;
  };
  
  // Générer une réponse à l'exploration des données
  const generateExplorationResponse = (userInput: string) => {
    return `# Exploration des données

Tu as identifié des colonnes intéressantes à analyser. En explorant davantage :

- Je remarque que certaines colonnes ont des valeurs manquantes (environ 15%)
- La distribution des valeurs numériques semble avoir quelques outliers qui pourraient influencer ton analyse
- Il y a des corrélations intéressantes entre certaines variables que tu as mentionnées

**Observations supplémentaires** :
- Les tendances sont différentes selon les segments
- Certains patterns temporels semblent émerger des données

**Étape suivante** : 
Pour approfondir ton analyse, quelles hypothèses souhaites-tu tester ? Quelles analyses ou visualisations te seraient utiles à ce stade ?`;
  };
  
  // Générer une réponse à l'analyse
  const generateAnalysisResponse = (userInput: string) => {
    return `# Résultats de l'analyse

J'ai effectué les analyses que tu as demandées. Voici les résultats clés :

1. **Corrélation significative** (p-value < 0.01) entre les variables que tu as mentionnées
2. **Segmentation** : J'ai identifié 3 clusters distincts avec des comportements différents
3. **Analyse temporelle** : On observe une tendance à la hausse sur certains métriques, mais avec une saisonnalité marquée

**Visualisation** :
- Le graphique montre clairement une relation non-linéaire
- Les segments que tu as identifiés présentent des différences statistiquement significatives

Ces résultats confirment partiellement ton hypothèse initiale, mais ils révèlent aussi des nuances importantes.

**Prochaine étape** :
Sur base de ces analyses, quelle recommandation formulerais-tu pour répondre à l'objectif métier initial ?`;
  };
  
  // Générer une réponse à la recommandation
  const generateRecommendationResponse = (userInput: string) => {
    return `# Évaluation de ta recommandation

Ta recommandation est bien fondée sur les données analysées. Elle adresse directement le problème identifié et propose une solution concrète.

**Points forts** :
- Tu as bien relié ton analyse aux enjeux métiers
- Ta proposition est actionnable et spécifique
- Tu as pris en compte les contraintes du contexte

**Réflexions supplémentaires** :
- As-tu considéré les potentiels effets secondaires de cette recommandation ?
- Quels KPIs permettraient de mesurer le succès de l'implémentation ?

**Étape finale** :
Tu dois maintenant présenter ta recommandation au directeur/client en 2-3 minutes. 
Comment formulerais-tu synthétiquement ton analyse et ta recommandation pour convaincre cette personne qui n'a pas de background technique ?`;
  };
  
  // Générer une réponse à la présentation au client/directeur
  const generatePresentationResponse = (userInput: string) => {
    return `# Retour du directeur

*Le directeur vous écoute attentivement, puis répond :*

"Merci pour cette analyse. Je comprends mieux la situation maintenant. J'ai deux questions :

1. Quel niveau de confiance avez-vous dans ces conclusions ? Avons-nous suffisamment de données pour agir ?

2. Si nous implémentons votre recommandation, dans quel délai pouvons-nous espérer voir des résultats ?

Et si nous avions un budget limité, quelle serait la première action à prioriser ?"

*C'est à vous de répondre à ces questions pour conclure la présentation.*`;
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

  // Gérer l'envoi du message avec la touche Entrée (Shift+Entrée pour nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Formatter les messages Markdown
  const formatContent = (content: string) => {
    // Remplacer les titres
    content = content.replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold text-white mb-2 mt-3">$1</h2>');
    content = content.replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold text-white mb-2 mt-3">$1</h3>');
    
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
      if (!paragraph.includes('<h2') && !paragraph.includes('<h3') && !paragraph.includes('<li') && !paragraph.includes('<table')) {
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
              
              <Badge className={currentStage !== 'complete' ? "bg-green-600" : "bg-blue-600"}>
                {currentStage === 'introduction' && 'Briefing'}
                {currentStage === 'exploration' && 'Exploration des données'}
                {currentStage === 'analysis' && 'Analyse'}
                {currentStage === 'recommendation' && 'Recommandation'}
                {currentStage === 'presentation' && 'Présentation'}
                {currentStage === 'feedback' && 'Feedback'}
                {currentStage === 'complete' && 'Session terminée'}
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Interface de Chat */}
          <Card className={`${
            highContrastMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-700/30'
          }`}>
            <CardContent className="p-0">
              <div className="flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
                {/* Zone de messages */}
                <div className="flex-1 overflow-y-auto p-4">
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
                
                {/* Zone de saisie */}
                <div className={`border-t ${
                  highContrastMode 
                    ? 'border-gray-700' 
                    : 'border-blue-800/50'
                } p-4`}>
                  <div className="flex items-end">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Tapez votre message ici..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`flex-1 mr-2 min-h-[60px] max-h-[200px] ${
                        highContrastMode 
                          ? 'bg-gray-700 border-gray-600 focus-visible:ring-blue-500' 
                          : 'bg-blue-950/50 border-blue-800/50 focus-visible:ring-cyan-500'
                      }`}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !messageInput.trim()}
                      className={`${
                        highContrastMode 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                      } text-white h-[60px] px-4`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
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