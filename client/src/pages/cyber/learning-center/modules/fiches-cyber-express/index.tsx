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
  Clock
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
- **Tracing et monitoring système**

## Compétences requises pour le Threat Hunter

- Connaissance approfondie des TTP adversaires
- Compréhension des systèmes, réseaux et applications
- Maîtrise des outils d'analyse de sécurité
- Pensée analytique et résolution de problèmes
- Capacité à formuler et tester des hypothèses
- Connaissances en analyse de données et statistiques
      `,
      keyPoints: [
        "Le Threat Hunting est une démarche proactive de recherche de menaces déjà présentes",
        "Il se base sur la formulation et vérification d'hypothèses de compromission",
        "Une bonne connaissance des tactiques adversaires (TTPs) est essentielle",
        "L'établissement d'une ligne de base comportementale facilite l'identification d'anomalies",
        "Le processus doit être itératif et contribuer à l'amélioration continue des défenses"
      ],
      references: [
        'SANS - Effective Threat Hunting',
        'MITRE ATT&CK Framework',
        'Sqrrl - A Framework for Cyber Threat Hunting',
        'NIST SP 800-61 - Computer Security Incident Handling Guide'
      ],
      icon: <AlertCircle />,
      isFavorite: false,
      hasBeenRead: false
    }
  ];
  
  // Initialisation des fiches
  useEffect(() => {
    // Simuler le chargement depuis une API
    setFiches(demoFiches);
    
    // Initialiser les compteurs
    const favCount = demoFiches.filter(fiche => fiche.isFavorite).length;
    const readCount = demoFiches.filter(fiche => fiche.hasBeenRead).length;
    setFavoriteCount(favCount);
    setReadCount(readCount);
  }, []);

  // Filtrage des fiches
  const filteredFiches = fiches
    .filter(fiche => 
      fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fiche.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.keyPoints.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(fiche => selectedCategory === 'all' || fiche.category === selectedCategory)
    .filter(fiche => selectedLevel === 'all' || fiche.level === selectedLevel)
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return a.id > b.id ? -1 : 1;
      } else if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === 'level') {
        const levelOrder = { 'débutant': 1, 'intermédiaire': 2, 'avancé': 3, 'tous niveaux': 4 };
        return levelOrder[a.level] - levelOrder[b.level];
      } else {
        return 0;
      }
    });

  // Gestion des favoris
  const handleToggleFavorite = (id: string) => {
    setFiches(fiches.map(fiche => {
      if (fiche.id === id) {
        const newState = !fiche.isFavorite;
        if (newState) {
          toast({ 
            title: "Ajouté aux favoris", 
            description: "Cette fiche est maintenant dans vos favoris" 
          });
        } else {
          toast({ 
            title: "Retiré des favoris", 
            description: "Cette fiche a été retirée de vos favoris" 
          });
        }
        return { ...fiche, isFavorite: newState };
      }
      return fiche;
    }));
    
    // Mettre à jour le compteur de favoris
    const updatedFavoriteCount = fiches.filter(f => f.id === id ? !f.isFavorite : f.isFavorite).length;
    setFavoriteCount(updatedFavoriteCount);
  };

  // Marquer comme lu
  const handleToggleRead = (id: string) => {
    setFiches(fiches.map(fiche => {
      if (fiche.id === id) {
        const newState = !fiche.hasBeenRead;
        if (newState) {
          toast({ 
            title: "Fiche marquée comme lue", 
            description: "Votre progression a été enregistrée" 
          });
        }
        return { ...fiche, hasBeenRead: newState };
      }
      return fiche;
    }));
    
    // Mettre à jour le compteur de fiches lues
    const updatedReadCount = fiches.filter(f => f.id === id ? !f.hasBeenRead : f.hasBeenRead).length;
    setReadCount(updatedReadCount);
  };

  // Télécharger la fiche en PDF
  const downloadFiche = (fiche: FicheCyber) => {
    // Dans une implémentation réelle, on utiliserait une librairie comme jsPDF
    // Ici, on simule simplement le téléchargement
    const element = document.createElement('a');
    const file = new Blob([`# ${fiche.title}\n\n${fiche.description}\n\n${fiche.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${fiche.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Téléchargement réussi",
      description: `La fiche "${fiche.title}" a été téléchargée au format Markdown`,
    });
  };

  // Générer une nouvelle fiche avec l'IA
  const generateFiche = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un sujet pour générer une fiche",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simuler la génération par l'IA avec un timer
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 5;
        setProgress(progressValue);
        
        if (progressValue >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newFiche: FicheCyber = {
              id: `gen-${Date.now()}`,
              title: `${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)}`,
              category: 'personnalisé',
              level: 'tous niveaux',
              description: `Fiche générée sur le thème : ${aiPrompt}`,
              content: `# ${aiPrompt}\n\nCette fiche a été générée par IA sur la base de votre demande.\n\nDans une implémentation réelle, le contenu serait généré par une IA via l'API OpenAI ou Azure OpenAI.`,
              keyPoints: [
                "Point clé généré par IA 1",
                "Point clé généré par IA 2",
                "Point clé généré par IA 3"
              ],
              references: [
                "Référence générée 1",
                "Référence générée 2"
              ],
              icon: <BrainCircuit />,
              isFavorite: false,
              hasBeenRead: false
            };
            
            setFiches([newFiche, ...fiches]);
            setSelectedFiche(newFiche);
            setAiPrompt('');
            setIsGenerating(false);
            setProgress(0);
            
            toast({
              title: "Génération réussie",
              description: "Votre fiche personnalisée a été créée avec succès"
            });
          }, 1000);
        }
      }, 100);
    } catch (error) {
      setIsGenerating(false);
      setProgress(0);
      toast({
        title: "Erreur de génération",
        description: "Un problème est survenu lors de la génération de la fiche",
        variant: "destructive"
      });
    }
  };

  // Fonction pour utiliser l'horloge avec un compte à rebours
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFicheTimer = (timeInMinutes: number) => {
    const seconds = timeInMinutes * 60;
    setTimeRemaining(seconds);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Marquer automatiquement comme lu à l'expiration du timer
          if (selectedFiche) {
            handleToggleRead(selectedFiche.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/cyber/learning-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageTitle title="Fiches Cyber Express" subtitle="Consultez et apprenez rapidement avec nos fiches synthétiques" />
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une fiche..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border rounded-md space-y-3">
                  {/* Filtre par catégorie */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Catégorie</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={selectedCategory === 'all' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Toutes
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'menaces' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('menaces')}
                      >
                        Menaces
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'vulnérabilités' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('vulnérabilités')}
                      >
                        Vulnérabilités
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'architecture' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('architecture')}
                      >
                        Architecture
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'identité' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('identité')}
                      >
                        Identité
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'détection' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('détection')}
                      >
                        Détection
                      </Badge>
                      <Badge 
                        variant={selectedCategory === 'personnalisé' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory('personnalisé')}
                      >
                        Personnalisées
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Filtre par niveau */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Niveau</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={selectedLevel === 'all' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedLevel('all')}
                      >
                        Tous
                      </Badge>
                      <Badge 
                        variant={selectedLevel === 'débutant' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedLevel('débutant')}
                      >
                        Débutant
                      </Badge>
                      <Badge 
                        variant={selectedLevel === 'intermédiaire' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedLevel('intermédiaire')}
                      >
                        Intermédiaire
                      </Badge>
                      <Badge 
                        variant={selectedLevel === 'avancé' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedLevel('avancé')}
                      >
                        Avancé
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Tri */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tri</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={sortOrder === 'recent' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSortOrder('recent')}
                      >
                        Plus récent
                      </Badge>
                      <Badge 
                        variant={sortOrder === 'title' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSortOrder('title')}
                      >
                        Alphabétique
                      </Badge>
                      <Badge 
                        variant={sortOrder === 'level' ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSortOrder('level')}
                      >
                        Par niveau
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Onglets */}
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="browse" className="flex-1">Parcourir</TabsTrigger>
              <TabsTrigger value="create" className="flex-1">Générer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-4 mt-4">
              {/* Liste des fiches */}
              {filteredFiches.length > 0 ? (
                <div className="space-y-3">
                  {filteredFiches.map((fiche) => (
                    <Card 
                      key={fiche.id} 
                      className={`cursor-pointer transition-all hover:border-primary ${selectedFiche?.id === fiche.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedFiche(fiche)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="mt-1 p-2 rounded-md bg-muted flex items-center justify-center">
                              {fiche.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{fiche.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{fiche.description}</p>
                              <div className="flex items-center mt-2 space-x-2">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {fiche.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {fiche.level}
                                </Badge>
                                {fiche.hasBeenRead && (
                                  <Badge variant="secondary" className="text-xs">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    Lu
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${fiche.isFavorite ? 'text-amber-500' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(fiche.id);
                            }}
                          >
                            <Star className="h-4 w-4" fill={fiche.isFavorite ? 'currentColor' : 'none'} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Aucune fiche trouvée</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essayez de modifier vos filtres ou de créer une nouvelle fiche.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Générer une fiche personnalisée</h3>
                <p className="text-sm text-muted-foreground">
                  Entrez un sujet de cybersécurité et notre IA générera une fiche synthétique pour vous.
                </p>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Ex: Sécurité des environnements cloud, chiffrement AES, etc."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                  
                  <Button 
                    className="w-full"
                    onClick={generateFiche}
                    disabled={isGenerating || !aiPrompt.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <BrainCircuit className="mr-2 h-4 w-4 animate-pulse" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Générer une fiche
                      </>
                    )}
                  </Button>
                  
                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        {progress}% - L'IA analyse et synthétise les informations
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    Exemples de sujets
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li className="cursor-pointer hover:text-primary" onClick={() => setAiPrompt("Principes du Bug Bounty")}>
                      • Principes du Bug Bounty
                    </li>
                    <li className="cursor-pointer hover:text-primary" onClick={() => setAiPrompt("Sécuriser les containers Docker")}>
                      • Sécuriser les containers Docker
                    </li>
                    <li className="cursor-pointer hover:text-primary" onClick={() => setAiPrompt("Détection d'intrusion réseau")}>
                      • Détection d'intrusion réseau
                    </li>
                    <li className="cursor-pointer hover:text-primary" onClick={() => setAiPrompt("Sécurité des API REST")}>
                      • Sécurité des API REST
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Panneau de droite : Contenu de la fiche */}
        <div className="lg:col-span-2">
          {selectedFiche ? (
            <div className="border rounded-lg h-full">
              <div className="p-6 border-b sticky top-0 bg-card z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-muted">
                      {selectedFiche.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedFiche.title}</h2>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {selectedFiche.category}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {selectedFiche.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFiche(selectedFiche)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                    <Button
                      variant={selectedFiche.isFavorite ? "default" : "outline"}
                      size="icon"
                      className={selectedFiche.isFavorite ? "text-amber-500" : ""}
                      onClick={() => handleToggleFavorite(selectedFiche.id)}
                    >
                      <Star className="h-4 w-4" fill={selectedFiche.isFavorite ? "currentColor" : "none"} />
                    </Button>
                    {!selectedFiche.hasBeenRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startFicheTimer(5)}
                        className="flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Lire (5 min)
                      </Button>
                    )}
                    {timeRemaining > 0 && (
                      <Badge variant="outline" className="ml-2 py-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(timeRemaining)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!selectedFiche.hasBeenRead && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <Progress value={timeRemaining > 0 ? (300 - timeRemaining) / 3 : 0} className="h-2" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleRead(selectedFiche.id)}
                    >
                      Marquer comme lu
                    </Button>
                  </div>
                )}
                
                {selectedFiche.hasBeenRead && (
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Fiche lue
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-6 overflow-auto prose prose-blue max-w-none h-[calc(100vh-350px)] pb-20">
                <p className="text-lg font-medium mb-4">{selectedFiche.description}</p>
                
                {/* Contenu en Markdown */}
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedFiche.content
                    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-5 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
                    .replace(/^\d\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
                    .split('\n\n').join('<p></p>')
                }} />
                
                <div className="mt-8 bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Points clés à retenir</h3>
                  <ul className="space-y-2">
                    {selectedFiche.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary mt-2 mr-2"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Références</h3>
                  <ul className="space-y-1 text-sm">
                    {selectedFiche.references.map((ref, index) => (
                      <li key={index} className="text-blue-600 dark:text-blue-400">
                        <a href="#" className="hover:underline">{ref}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg h-full flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Sélectionnez une fiche</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Choisissez une fiche dans la liste à gauche pour afficher son contenu ou générez une nouvelle fiche personnalisée.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}