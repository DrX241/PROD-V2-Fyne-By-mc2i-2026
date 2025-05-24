import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Star, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Shield,
  Database,
  Globe,
  Server,
  Lock,
  Network,
  Zap,
  AlertCircle,
  BrainCircuit,
  Clock,
  Sparkles,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface FicheCyber {
  id: string;
  title: string;
  category: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  description: string;
  content: string;
  keyPoints: string[];
  references: string[];
  icon: React.ReactElement;
  isFavorite: boolean;
  hasBeenRead: boolean;
}

export default function FichesCyberExpress() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [selectedFiche, setSelectedFiche] = useState<FicheCyber | null>(null);
  const [fiches, setFiches] = useState<FicheCyber[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Données de démo pour les fiches
  const demoFiches: FicheCyber[] = [
    {
      id: 'ransomware',
      title: 'Ransomware : comprendre et se protéger',
      category: 'menaces',
      level: 'débutant',
      description: 'Principes de fonctionnement des ransomwares et méthodes de protection efficaces',
      content: `
## Qu'est-ce qu'un ransomware ?

Un ransomware (ou rançongiciel) est un type de logiciel malveillant qui chiffre les données de la victime et exige le paiement d'une rançon pour fournir la clé de déchiffrement. Les ransomwares modernes pratiquent souvent la double extorsion : ils menacent également de publier les données volées si la rançon n'est pas payée.

## Comment fonctionnent les ransomwares ?

1. **Infection** : Principalement par phishing, téléchargements infectés ou exploitation de vulnérabilités
2. **Installation** : Le malware s'installe et établit la persistance dans le système
3. **Communication** : Établissement d'une connexion avec les serveurs de commande et contrôle (C2)
4. **Chiffrement** : Les fichiers sont chiffrés avec des algorithmes puissants
5. **Demande de rançon** : Affichage d'un message exigeant le paiement, souvent en cryptomonnaie

## Techniques de protection essentielles

- Sauvegardes régulières hors ligne (3-2-1 : 3 copies, 2 supports différents, 1 hors site)
- Formation des utilisateurs à la reconnaissance des tentatives de phishing
- Mise à jour systématique des logiciels et systèmes d'exploitation
- Segmentation du réseau pour limiter la propagation
- Principe du moindre privilège pour les comptes utilisateurs
- Solutions EDR (Endpoint Detection and Response)
- Filtrage des emails et protection web
      `,
      keyPoints: [
        "Les ransomwares chiffrent les données et exigent une rançon pour les déchiffrer",
        "La double extorsion combine chiffrement et menace de publication des données",
        "Le phishing est le principal vecteur d'infection",
        "Les sauvegardes régulières non connectées sont la meilleure protection",
        "Ne jamais payer la rançon sans avoir consulté des experts en cybersécurité"
      ],
      references: [
        'ANSSI - Note technique "Panorama des attaques par rançongiciels"',
        'NIST - Special Publication 1800-25, "Identifying and Protecting Assets Against Ransomware"',
        'FBI - Ransomware Prevention and Response Guide'
      ],
      icon: <Shield />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'zero-trust',
      title: 'Zero Trust : au-delà du périmètre',
      category: 'architecture',
      level: 'intermédiaire',
      description: 'Principes et mise en œuvre du modèle de sécurité Zero Trust',
      content: `
## Le modèle Zero Trust

Le modèle de sécurité Zero Trust part du principe qu'aucune entité, qu'elle soit à l'intérieur ou à l'extérieur du réseau de l'organisation, ne doit être considérée comme fiable par défaut. Contrairement à l'approche traditionnelle "castle-and-moat" (château et douves) qui fait confiance par défaut aux utilisateurs internes, Zero Trust adopte la philosophie "never trust, always verify" (ne jamais faire confiance, toujours vérifier).

## Principes fondamentaux

1. **Vérification explicite** : Authentification et autorisation basées sur toutes les informations disponibles
2. **Accès avec privilège minimum** : Limitation des accès utilisateur au strict nécessaire (Just-in-Time et Just-Enough-Access)
3. **Présomption de compromission** : Supposer que des brèches existent, vérifier les connexions en continu

## Composants clés d'une architecture Zero Trust

- **Gestion des identités forte** : MFA, authentification contextuelle, gestion du cycle de vie des identités
- **Micro-segmentation** : Segmentation fine du réseau pour isoler les ressources
- **Chiffrement de bout en bout** : Protection des données en transit et au repos
- **Contrôle d'accès adaptatif** : Ajustement dynamique des autorisations selon le contexte
- **Surveillance continue** : Analyse comportementale et détection d'anomalies

## Étapes de mise en œuvre

1. Identifier les données sensibles et les flux d'application
2. Cartographier les flux de transactions protégées
3. Concevoir l'architecture Zero Trust
4. Créer des politiques Zero Trust
5. Surveiller et alerter sur le réseau
      `,
      keyPoints: [
        "Zero Trust repose sur le principe \"ne jamais faire confiance, toujours vérifier\"",
        "L'authentification et l'autorisation sont requises pour tous, partout",
        "L'accès aux ressources est limité au strict minimum nécessaire",
        "La surveillance continue et l'analyse comportementale sont essentielles",
        "Zero Trust est une stratégie, pas un produit ou une technologie unique"
      ],
      references: [
        'NIST SP 800-207 - Zero Trust Architecture',
        'Gartner - "Market Guide for Zero Trust Network Access"',
        'ANSSI - Recommandations pour la mise en œuvre d\'une architecture Zero Trust'
      ],
      icon: <Lock />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      category: 'vulnérabilités',
      level: 'intermédiaire',
      description: 'Comprendre, détecter et prévenir les attaques XSS',
      content: `
## Qu'est-ce que le Cross-Site Scripting (XSS) ?

Le Cross-Site Scripting (XSS) est une vulnérabilité de sécurité web permettant à un attaquant d'injecter du code malveillant (généralement JavaScript) qui s'exécute dans le navigateur des utilisateurs. Cette attaque cible les utilisateurs plutôt que l'application directement.

## Types d'attaques XSS

1. **XSS réfléchi (Reflected XSS)** : Le code malveillant est inclus dans une requête envoyée à un serveur web et "réfléchi" immédiatement vers l'utilisateur dans la réponse.

2. **XSS stocké (Stored XSS)** : Le code malveillant est stocké sur le serveur cible (dans une base de données, un message de forum, etc.) et présenté aux utilisateurs lors de l'accès au contenu affecté.

3. **XSS basé sur le DOM (DOM-based XSS)** : Le code malveillant est exécuté via la manipulation du DOM dans le navigateur de la victime, sans nécessairement être envoyé au serveur.

## Impacts et risques

- Vol de cookies de session et d'identifiants
- Hameçonnage ciblé et vol d'identifiants
- Capture de frappes et vol de données sensibles
- Redirection vers des sites malveillants
- Défiguration de site web
- Installation de malware via drive-by download
- Exécution d'actions non autorisées au nom de l'utilisateur

## Techniques de prévention

1. **Échappement et encodage du contexte**
   - HTML escape pour le contenu dans le corps HTML
   - Encodage des attributs HTML
   - Encodage JavaScript pour les données insérées dans des scripts
   - Encodage CSS pour les données dans les styles

2. **Validation des entrées**
   - Validation côté serveur (prioritaire)
   - Validation côté client (couche additionnelle)
   - Filtrage des caractères spéciaux

3. **En-têtes de sécurité**
   - Content-Security-Policy (CSP)
   - X-XSS-Protection
   - X-Content-Type-Options

4. **Frameworks et bibliothèques sécurisées**
   - Utiliser des frameworks qui échappent automatiquement les sorties
   - Ne pas désactiver les protections intégrées
      `,
      keyPoints: [
        "Le XSS permet l'injection de scripts malveillants dans les pages web vues par d'autres utilisateurs",
        "Les trois principaux types sont: réfléchi, stocké et basé sur le DOM",
        "Les conséquences incluent le vol de session, le détournement de compte et le vol de données",
        "La validation des entrées et l'échappement des sorties sont essentiels",
        "Content Security Policy (CSP) est une protection efficace contre le XSS"
      ],
      references: [
        'OWASP - XSS Prevention Cheat Sheet',
        'OWASP - Content Security Policy Cheat Sheet',
        'Portswigger Web Security Academy - Cross-site scripting'
      ],
      icon: <Globe />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'mfa',
      title: 'Authentification multifacteur (MFA)',
      category: 'identité',
      level: 'débutant',
      description: 'Comprendre et mettre en œuvre l\'authentification multifacteur',
      content: `
## Qu'est-ce que l'authentification multifacteur (MFA) ?

L'authentification multifacteur (MFA) est une méthode de sécurité qui exige que l'utilisateur fournisse au moins deux formes d'identification différentes pour accéder à un compte ou à un système. Cette approche renforce considérablement la sécurité en combinant plusieurs facteurs d'authentification.

## Les trois catégories de facteurs d'authentification

1. **Quelque chose que vous connaissez** (facteur de connaissance)
   - Mot de passe ou phrase de passe
   - Code PIN
   - Réponses à des questions de sécurité

2. **Quelque chose que vous possédez** (facteur de possession)
   - Téléphone mobile (pour recevoir des SMS ou utiliser une application)
   - Token physique ou clé de sécurité (YubiKey, etc.)
   - Carte à puce

3. **Quelque chose que vous êtes** (facteur inhérent ou biométrique)
   - Empreinte digitale
   - Reconnaissance faciale
   - Scan de l'iris ou de la rétine
   - Reconnaissance vocale

## Méthodes courantes de MFA

1. **Applications d'authentification**
   - Google Authenticator, Microsoft Authenticator, Authy
   - Génération de codes TOTP (Time-based One-Time Password)
   - Avantage: fonctionne sans connexion internet

2. **SMS et appels vocaux**
   - Code envoyé par message texte ou appel vocal
   - Moins sécurisé mais facile à mettre en œuvre
   - Vulnérable au SIM swapping

3. **Clés de sécurité physiques**
   - Dispositifs USB comme YubiKey, Titan Security Key
   - Basés sur les standards FIDO2/WebAuthn
   - Très sécurisé contre le phishing

4. **Biométrie**
   - Reconnaissance faciale, empreintes digitales
   - Généralement couplée à un dispositif (téléphone, ordinateur)

## Bonnes pratiques de mise en œuvre

1. Adopter une approche par couches (plusieurs méthodes MFA disponibles)
2. Proposer des méthodes alternatives en cas d'indisponibilité
3. Générer des codes de secours à usage unique
4. Former les utilisateurs à l'importance du MFA
5. Surveiller et journaliser les tentatives d'authentification
6. Privilégier des solutions résistantes au phishing comme WebAuthn
      `,
      keyPoints: [
        "Le MFA combine au moins deux facteurs d'authentification distincts",
        "Les trois catégories de facteurs sont : connaissance, possession et inhérence",
        "Les applications d'authentification sont préférables aux SMS",
        "Les clés de sécurité physiques offrent le plus haut niveau de protection",
        "Le MFA réduit drastiquement le risque de compromission de compte"
      ],
      references: [
        'NIST SP 800-63B - Digital Identity Guidelines (Authentication)',
        'ANSSI - Recommandations relatives à l\'authentification multifacteur',
        'CISA - Capacity Enhancement Guide: Implementing Strong Authentication'
      ],
      icon: <Lock />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'threat-hunting',
      title: 'Threat Hunting : la chasse aux menaces',
      category: 'détection',
      level: 'avancé',
      description: 'Méthodologies et techniques de chasse aux menaces proactive',
      content: `
## Qu'est-ce que le Threat Hunting ?

Le Threat Hunting (chasse aux menaces) est une démarche proactive de recherche d'activités malveillantes qui ont échappé aux détections automatisées dans un environnement informatique. Contrairement aux approches réactives traditionnelles, le Threat Hunting part de l'hypothèse que des adversaires sont déjà présents dans l'environnement et cherche activement à les identifier.

## Principes fondamentaux

1. **Approche basée sur des hypothèses** : Formulation de théories sur les possibles techniques d'attaque, basées sur la connaissance des tactiques adversaires (TTP - Tactiques, Techniques et Procédures)

2. **Intelligence sur les menaces** : Utilisation des informations sur les menaces pertinentes pour l'organisation

3. **Compréhension du comportement normal** : Établissement d'une base de référence pour identifier les anomalies

4. **Analyse de données et corrélation** : Examen des données provenant de multiples sources

## Méthodologie du Threat Hunting

### 1. Préparation
- Définir l'objectif et la portée de la chasse
- Collecter et organiser les informations sur les menaces
- Analyser les vulnérabilités et les expositions potentielles
- Préparer les outils et les accès nécessaires

### 2. Formulation d'hypothèses
- Définir des hypothèses basées sur les TTP des attaquants
- S'appuyer sur les frameworks MITRE ATT&CK, TIBER-EU, etc.
- Prioriser les hypothèses selon le niveau de risque

### 3. Collecte et analyse des données
- Logs de sécurité (EDR, NDR, SIEM)
- Trafic réseau et communications
- Comportements des utilisateurs
- Utilisation des ressources système
- Actions privilégiées

### 4. Identification et investigation
- Recherche d'indicateurs de compromission (IOC)
- Analyse des comportements anormaux
- Investigation approfondie des anomalies détectées
- Documentation des découvertes

### 5. Réponse et amélioration
- Élimination des menaces identifiées
- Documentation des leçons apprises
- Amélioration des défenses (ajout de règles de détection)
- Partage des connaissances acquises

## Techniques et outils de Threat Hunting

- **Analyse comportementale** (UEBA - User and Entity Behavior Analytics)
- **Détection d'anomalies** (statistiques, apprentissage automatique)
- **Visualisation de données** pour identifier les motifs et tendances
- **Analyse de logs et de trafic réseau**
- **Forensique mémoire et disque**
- **Tracing et monitoring des processus**
      `,
      keyPoints: [
        "Le Threat Hunting est une approche proactive de recherche de menaces",
        "Il repose sur la formulation d'hypothèses basées sur les TTP des attaquants",
        "L'analyse comportementale et la détection d'anomalies sont des techniques clés",
        "Le processus est itératif et contribue à l'amélioration continue des défenses",
        "Il nécessite une combinaison de compétences techniques et d'expertise en sécurité"
      ],
      references: [
        'SANS - The Hunter Strikes Back: The SANS Guide to Threat Hunting',
        'MITRE ATT&CK Framework',
        'Sqrrl - A Framework for Cyber Threat Hunting'
      ],
      icon: <Search />,
      isFavorite: false,
      hasBeenRead: false
    }
  ];

  // Initialisation des fiches
  useEffect(() => {
    setFiches(demoFiches);
  }, []);

  // Calculer le nombre de fiches favorites et lues
  useEffect(() => {
    const favorites = fiches.filter(fiche => fiche.isFavorite).length;
    const read = fiches.filter(fiche => fiche.hasBeenRead).length;
    
    setFavoriteCount(favorites);
    setReadCount(read);
  }, [fiches]);

  // Fonction pour filtrer les fiches selon les critères
  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         fiche.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fiche.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || fiche.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || fiche.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Fonction pour trier les fiches
  const sortedFiches = [...filteredFiches].sort((a, b) => {
    if (sortOrder === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (sortOrder === 'level') {
      const levelOrder: Record<string, number> = {
        'débutant': 1,
        'intermédiaire': 2,
        'avancé': 3,
        'tous niveaux': 4
      };
      return levelOrder[a.level] - levelOrder[b.level];
    } else {
      // Par défaut, tri par "récent" (en utilisant l'ordre du tableau)
      return 0;
    }
  });

  // Fonction pour marquer une fiche comme lue
  const markAsRead = (id: string) => {
    setFiches(fiches.map(fiche => 
      fiche.id === id ? { ...fiche, hasBeenRead: true } : fiche
    ));
  };

  // Fonction pour marquer/démarquer une fiche comme favorite
  const toggleFavorite = (id: string) => {
    setFiches(fiches.map(fiche => 
      fiche.id === id ? { ...fiche, isFavorite: !fiche.isFavorite } : fiche
    ));
  };

  // Fonction pour générer une fiche personnalisée via l'IA
  const generateFiche = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une demande pour générer une fiche",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setTimeRemaining(30);

    // Simuler la progression
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 3.33; // 3.33% par seconde pendant 30 secondes
        
        if (newProgress >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 100;
        }
        
        return newProgress;
      });
      
      setTimeRemaining(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      // Simuler la réponse de l'IA
      const response = {
        success: true,
        data: {
          fiche: {
            id: `custom-${Date.now()}`,
            title: `Fiche personnalisée sur ${aiPrompt.slice(0, 30)}...`,
            category: 'personnalisé',
            level: 'tous niveaux',
            description: `Fiche générée sur base de votre demande: "${aiPrompt}"`,
            content: `
## ${aiPrompt}

Cette fiche personnalisée a été générée pour répondre à votre demande spécifique. Dans une version complète, le contenu serait généré par un modèle de langage avancé comme GPT-4o.

### Points clés

- Le contenu serait structuré en sections logiques
- Des exemples concrets illustreraient les concepts
- Des recommandations pratiques seraient fournies
- Les meilleures pratiques du secteur seraient présentées

### Conclusion

Cette fiche simulée démontre le concept de génération de fiches personnalisées à la demande.
`,
            keyPoints: [
              "Contenu personnalisé basé sur votre demande",
              "Structure claire et logique",
              "Informations à jour et pertinentes",
              "Adaptée à votre niveau de connaissance",
              "Références vérifiées par des experts"
            ],
            references: [
              'Documentation générée par IA',
              'Sources fiables dans le domaine de la cybersécurité'
            ],
            icon: <BrainCircuit />,
            isFavorite: false,
            hasBeenRead: false
          }
        }
      };

      if (response.success) {
        // Création d'une nouvelle fiche
        const newFiche: FicheCyber = {
          id: response.data.fiche.id,
          title: response.data.fiche.title,
          category: response.data.fiche.category,
          level: response.data.fiche.level as 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux',
          description: response.data.fiche.description,
          content: response.data.fiche.content,
          keyPoints: response.data.fiche.keyPoints,
          references: response.data.fiche.references,
          icon: response.data.fiche.icon,
          isFavorite: false,
          hasBeenRead: false
        };

        setFiches([newFiche, ...fiches]);
        setSelectedFiche(newFiche);
        setAiPrompt('');
        setIsGenerating(false);

        toast({
          title: "Génération réussie",
          description: "Votre fiche personnalisée a été créée avec succès"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la fiche:", error);
      setIsGenerating(false);
      setProgress(0);
      toast({
        title: "Erreur de génération",
        description: "Un problème est survenu lors de la génération de la fiche",
        variant: "destructive"
      });
    }
  };

  // Télécharger une fiche au format PDF
  const downloadFiche = (fiche: FicheCyber) => {
    toast({
      title: "Téléchargement en cours",
      description: `Téléchargement de "${fiche.title}" au format PDF`
    });
  };

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Mapping des icônes pour les catégories
  const iconMap: Record<string, React.ReactElement> = {
    'shield': <Shield />,
    'lock': <Lock />,
    'globe': <Globe />,
    'database': <Database />,
    'server': <Server />,
    'network': <Network />,
    'zap': <Zap />,
    'alert': <AlertCircle />,
    'brain': <BrainCircuit />
  };

  // Fonction pour créer un ID unique
  const createId = (title: string): string => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      <PageTitle title="Fiches Cyber Express | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-2">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="mr-3 h-6 w-6 text-indigo-400" />
              Fiches Cyber Express
            </h1>
            <p className="text-blue-200 mt-1">Consultez et apprenez rapidement avec nos fiches synthétiques</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de gauche : Liste des fiches et recherche */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Fiches disponibles</span>
                  <span className="font-medium">{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-border mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Lues</span>
                  <span className="font-medium">{readCount}/{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-border mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Favorites</span>
                  <span className="font-medium">{favoriteCount}</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher une fiche..." 
                className="pl-10 bg-background/50 border-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex justify-between items-center"
            >
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer et trier
              </div>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showFilters && (
              <div className="p-4 bg-background/50 rounded-md border border-border space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Catégories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={selectedCategory === 'all' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className="justify-start"
                    >
                      Toutes
                    </Button>
                    <Button 
                      variant={selectedCategory === 'menaces' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('menaces')}
                      className="justify-start"
                    >
                      Menaces
                    </Button>
                    <Button 
                      variant={selectedCategory === 'vulnérabilités' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('vulnérabilités')}
                      className="justify-start"
                    >
                      Vulnérabilités
                    </Button>
                    <Button 
                      variant={selectedCategory === 'architecture' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('architecture')}
                      className="justify-start"
                    >
                      Architecture
                    </Button>
                    <Button 
                      variant={selectedCategory === 'identité' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('identité')}
                      className="justify-start"
                    >
                      Identité
                    </Button>
                    <Button 
                      variant={selectedCategory === 'détection' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedCategory('détection')}
                      className="justify-start"
                    >
                      Détection
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Niveaux</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={selectedLevel === 'all' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLevel('all')}
                      className="justify-start"
                    >
                      Tous
                    </Button>
                    <Button 
                      variant={selectedLevel === 'débutant' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLevel('débutant')}
                      className="justify-start"
                    >
                      Débutant
                    </Button>
                    <Button 
                      variant={selectedLevel === 'intermédiaire' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLevel('intermédiaire')}
                      className="justify-start"
                    >
                      Intermédiaire
                    </Button>
                    <Button 
                      variant={selectedLevel === 'avancé' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedLevel('avancé')}
                      className="justify-start"
                    >
                      Avancé
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Tri</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={sortOrder === 'recent' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSortOrder('recent')}
                      className="justify-start"
                    >
                      Récent
                    </Button>
                    <Button 
                      variant={sortOrder === 'alphabetical' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSortOrder('alphabetical')}
                      className="justify-start"
                    >
                      A-Z
                    </Button>
                    <Button 
                      variant={sortOrder === 'level' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSortOrder('level')}
                      className="justify-start"
                    >
                      Niveau
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium mb-2">Fiches ({sortedFiches.length})</h3>
              <div className="space-y-2">
                {sortedFiches.length === 0 ? (
                  <div className="p-4 text-center bg-background/50 rounded-md border border-border">
                    <span className="text-muted-foreground">Aucune fiche trouvée</span>
                  </div>
                ) : (
                  sortedFiches.map(fiche => (
                    <div
                      key={fiche.id}
                      className={`p-3 rounded-md border hover:border-blue-500 cursor-pointer transition-all ${
                        selectedFiche?.id === fiche.id ? 'bg-blue-900/40 border-blue-500' : 'bg-background/50 border-border'
                      }`}
                      onClick={() => {
                        setSelectedFiche(fiche);
                        markAsRead(fiche.id);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-blue-400">
                            {fiche.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{fiche.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{fiche.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs py-0 h-5 capitalize">
                                {fiche.category}
                              </Badge>
                              <Badge 
                                className="text-xs py-0 h-5"
                                variant={
                                  fiche.level === 'débutant' ? 'success' : 
                                  fiche.level === 'intermédiaire' ? 'warning' : 
                                  fiche.level === 'avancé' ? 'destructive' : 'outline'
                                }
                              >
                                {fiche.level}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(fiche.id);
                          }}
                        >
                          <Star 
                            className={`h-4 w-4 ${fiche.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-800/40 mt-6">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
                Générer une fiche IA
              </h3>
              <p className="text-xs text-blue-200 mb-3">
                Demandez une fiche personnalisée sur n'importe quel sujet lié à la cybersécurité
              </p>
              <div className="space-y-3">
                <Input 
                  placeholder="Décrivez le sujet souhaité..."
                  className="bg-background/50 border-blue-800/50"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                {isGenerating ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-blue-200">
                      <span>Génération en cours</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeRemaining}s restantes
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-blue-950" />
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={generateFiche}
                  >
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Générer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Panneau central : Contenu de la fiche sélectionnée */}
          <div className="lg:col-span-2">
            {selectedFiche ? (
              <Card className="bg-background/50 border-border overflow-hidden">
                <div className="bg-blue-900/20 p-4 border-b border-border flex justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-full bg-blue-900/40">
                      {selectedFiche.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedFiche.title}</h2>
                      <p className="text-sm text-muted-foreground">{selectedFiche.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedFiche.id)}
                      className="h-9 w-9"
                    >
                      <Star 
                        className={`h-5 w-5 ${selectedFiche.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFiche(selectedFiche)}
                      className="h-9 w-9"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex gap-2">
                  <Badge 
                    variant="outline" 
                    className="capitalize"
                  >
                    {selectedFiche.category}
                  </Badge>
                  <Badge 
                    variant={
                      selectedFiche.level === 'débutant' ? 'success' : 
                      selectedFiche.level === 'intermédiaire' ? 'warning' : 
                      selectedFiche.level === 'avancé' ? 'destructive' : 'outline'
                    }
                  >
                    {selectedFiche.level}
                  </Badge>
                </div>
                <CardContent className="p-0">
                  <Tabs defaultValue="content">
                    <TabsList className="px-4 pt-2 bg-transparent border-b border-border">
                      <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Contenu
                      </TabsTrigger>
                      <TabsTrigger value="key-points" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Points clés
                      </TabsTrigger>
                      <TabsTrigger value="references" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        Références
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="p-6 m-0">
                      <div className="prose prose-invert max-w-none">
                        {selectedFiche.content.split('\n').map((paragraph, index) => {
                          if (paragraph.startsWith('##')) {
                            return <h2 key={index} className="text-xl font-bold mt-6 mb-4">{paragraph.replace('##', '').trim()}</h2>;
                          } else if (paragraph.startsWith('#')) {
                            return <h1 key={index} className="text-2xl font-bold mb-4 mt-2">{paragraph.replace('#', '').trim()}</h1>;
                          } else if (paragraph.startsWith('- ')) {
                            return <li key={index} className="ml-6 my-1">{paragraph.replace('- ', '')}</li>;
                          } else if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ') || paragraph.startsWith('5. ')) {
                            return <li key={index} className="ml-6 my-1 list-decimal">{paragraph.replace(/^\d+\.\s/, '')}</li>;
                          } else if (paragraph.startsWith('### ')) {
                            return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                          } else if (paragraph.trim() === '') {
                            return <br key={index} />;
                          } else {
                            return <p key={index} className="my-2">{paragraph}</p>;
                          }
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="key-points" className="p-6 m-0">
                      <h3 className="text-lg font-semibold mb-4">Points clés à retenir</h3>
                      <ul className="space-y-3">
                        {selectedFiche.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 bg-blue-900/40 p-1 rounded-full text-blue-300">
                              <Check className="h-4 w-4" />
                            </div>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="references" className="p-6 m-0">
                      <h3 className="text-lg font-semibold mb-4">Références et ressources</h3>
                      <ul className="space-y-2">
                        {selectedFiche.references.map((reference, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 text-blue-400">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <span>{reference}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-background/50 border border-border rounded-lg">
                <div className="p-3 bg-blue-900/20 rounded-full border border-blue-800/40 mb-4">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Sélectionnez une fiche</h3>
                <p className="text-muted-foreground max-w-md">
                  Choisissez une fiche dans la liste à gauche pour consulter son contenu détaillé, ou générez une nouvelle fiche personnalisée via l'IA.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}