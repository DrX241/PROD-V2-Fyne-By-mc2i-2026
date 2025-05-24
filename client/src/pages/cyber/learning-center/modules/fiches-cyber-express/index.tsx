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
    }
  ];

  // Initialisation des fiches
  useEffect(() => {
    setFiches(demoFiches);
    
    // Compter les fiches lues et favorites
    let favorites = 0;
    let read = 0;
    demoFiches.forEach(fiche => {
      if (fiche.isFavorite) favorites++;
      if (fiche.hasBeenRead) read++;
    });
    setFavoriteCount(favorites);
    setReadCount(read);
  }, []);

  // Filtrage des fiches
  const filteredFiches = fiches.filter(fiche => {
    // Filtre de recherche
    const matchesSearch = fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fiche.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fiche.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre de catégorie
    const matchesCategory = selectedCategory === 'all' || fiche.category === selectedCategory;
    
    // Filtre de niveau
    const matchesLevel = selectedLevel === 'all' || fiche.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Tri des fiches
  const sortedFiches = [...filteredFiches].sort((a, b) => {
    if (sortOrder === 'alphabetical') {
      return a.title.localeCompare(b.title, 'fr');
    } else if (sortOrder === 'level') {
      const levelOrder = { 'débutant': 1, 'intermédiaire': 2, 'avancé': 3, 'tous niveaux': 4 };
      return levelOrder[a.level] - levelOrder[b.level];
    } else if (sortOrder === 'favorites') {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.title.localeCompare(b.title, 'fr');
    } else {
      // Par défaut, tri par ajout récent (id)
      return a.id > b.id ? -1 : 1;
    }
  });

  // Gestion des favoris
  const toggleFavorite = (id: string) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id === id) {
        const newFavoriteStatus = !fiche.isFavorite;
        setFavoriteCount(prev => newFavoriteStatus ? prev + 1 : prev - 1);
        return { ...fiche, isFavorite: newFavoriteStatus };
      }
      return fiche;
    }));
    
    toast({
      title: "Préférences mises à jour",
      description: "Vos favoris ont été mis à jour",
      duration: 2000
    });
  };

  // Marquer comme lu
  const markAsRead = (id: string) => {
    setFiches(prev => prev.map(fiche => {
      if (fiche.id === id && !fiche.hasBeenRead) {
        setReadCount(prev => prev + 1);
        return { ...fiche, hasBeenRead: true };
      }
      return fiche;
    }));
  };

  // Génération d'une nouvelle fiche avec l'IA
  const startGeneratingFiche = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Entrée requise",
        description: "Veuillez décrire le sujet de la fiche à générer",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setTimeRemaining(30);
    
    // Simulation de progression
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 30);
        if (newProgress >= 100) {
          clearInterval(timerRef.current!);
          
          // Simuler l'ajout d'une nouvelle fiche
          const newFiche: FicheCyber = {
            id: `generated-${Date.now()}`,
            title: `Guide sur ${aiPrompt}`,
            category: 'personnalisé',
            level: 'tous niveaux',
            description: `Fiche personnalisée générée sur le sujet : ${aiPrompt}`,
            content: `
## ${aiPrompt}

Contenu généré automatiquement par l'IA sur ce sujet.

### Points principaux

- Premier point important concernant ${aiPrompt}
- Deuxième point clé
- Meilleures pratiques recommandées
- Outils et techniques associés

### Concepts associés

Liste des concepts et technologies en lien avec ce sujet.

### Références

- Sources et documentation de référence
            `,
            keyPoints: [
              `Aperçu général de ${aiPrompt}`,
              "Principes fondamentaux",
              "Meilleures pratiques",
              "Outils et techniques"
            ],
            references: [
              "Documentation générée automatiquement",
              "Sources compilées par l'IA"
            ],
            icon: <Sparkles />,
            isFavorite: false,
            hasBeenRead: false
          };
          
          setFiches(prev => [newFiche, ...prev]);
          setIsGenerating(false);
          setAiPrompt('');
          
          toast({
            title: "Fiche générée avec succès",
            description: `Une nouvelle fiche sur "${aiPrompt}" a été créée`,
            duration: 3000
          });
        }
        setTimeRemaining(prev => Math.max(0, prev - 1));
        return newProgress;
      });
    }, 1000);
  };

  // Annuler la génération
  const cancelGeneration = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsGenerating(false);
    
    toast({
      title: "Génération annulée",
      description: "La création de la fiche a été interrompue",
      duration: 2000
    });
  };

  // Supprimer une fiche
  const deleteFiche = (id: string) => {
    const ficheToDelete = fiches.find(fiche => fiche.id === id);
    
    if (ficheToDelete) {
      setFiches(prev => prev.filter(fiche => fiche.id !== id));
      
      if (ficheToDelete.isFavorite) {
        setFavoriteCount(prev => prev - 1);
      }
      
      if (ficheToDelete.hasBeenRead) {
        setReadCount(prev => prev - 1);
      }
      
      toast({
        title: "Fiche supprimée",
        description: `La fiche "${ficheToDelete.title}" a été supprimée`,
        duration: 2000
      });
      
      if (selectedFiche?.id === id) {
        setSelectedFiche(null);
      }
    }
  };

  // Importer une fiche à partir d'un fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedFiche = JSON.parse(content) as FicheCyber;
        
        // Validation basique
        if (!importedFiche.title || !importedFiche.content) {
          throw new Error("Format de fichier invalide");
        }
        
        // Ajouter l'icône par défaut si nécessaire
        if (!importedFiche.icon) {
          importedFiche.icon = <FileText />;
        }
        
        // Assurer que l'ID est unique
        importedFiche.id = `imported-${Date.now()}`;
        importedFiche.isFavorite = false;
        importedFiche.hasBeenRead = false;
        
        setFiches(prev => [importedFiche, ...prev]);
        
        toast({
          title: "Fiche importée avec succès",
          description: `La fiche "${importedFiche.title}" a été ajoutée`,
          duration: 3000
        });
      } catch (error) {
        toast({
          title: "Erreur d'importation",
          description: "Le fichier n'est pas au format attendu",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Exporter une fiche
  const exportFiche = (fiche: FicheCyber) => {
    // Préparer les données (sans les propriétés React)
    const exportData = {
      ...fiche,
      icon: null // On ne peut pas exporter les composants React
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fiche-${fiche.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Fiche exportée",
      description: `La fiche "${fiche.title}" a été téléchargée`,
      duration: 2000
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/cyber/learning-center">
            <Button variant="ghost" className="mr-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/30">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-blue-300">Fiches Cyber Express</h1>
            <p className="text-gray-400">Consultez et apprenez rapidement avec nos fiches synthétiques</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de gauche : Liste des fiches et recherche */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm text-blue-400">Fiches disponibles</span>
                  <span className="font-medium text-white">{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-blue-800/40 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-400">Lues</span>
                  <span className="font-medium text-white">{readCount}/{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-blue-800/40 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-400">Favorites</span>
                  <span className="font-medium text-white">{favoriteCount}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 border-blue-700 text-blue-400 hover:bg-blue-900/20"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
                {showFilters ? (
                  <ChevronUp className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 ml-1" />
                )}
              </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input
                type="text"
                placeholder="Rechercher une fiche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-blue-900/20 border-blue-800/50 focus:border-blue-500 text-white placeholder:text-blue-300/50"
              />
            </div>

            {/* Filtres */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/50 space-y-4">
                    {/* Filtre par catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-1">Catégorie</label>
                      <TabsList className="bg-blue-950/50 p-1 w-full">
                        <TabsTrigger
                          value="all"
                          className={`flex-1 ${selectedCategory === 'all' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedCategory('all')}
                        >
                          Toutes
                        </TabsTrigger>
                        <TabsTrigger
                          value="menaces"
                          className={`flex-1 ${selectedCategory === 'menaces' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedCategory('menaces')}
                        >
                          Menaces
                        </TabsTrigger>
                        <TabsTrigger
                          value="architecture"
                          className={`flex-1 ${selectedCategory === 'architecture' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedCategory('architecture')}
                        >
                          Architecture
                        </TabsTrigger>
                        <TabsTrigger
                          value="vulnérabilités"
                          className={`flex-1 ${selectedCategory === 'vulnérabilités' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedCategory('vulnérabilités')}
                        >
                          Vulnérabilités
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Filtre par niveau */}
                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-1">Niveau</label>
                      <TabsList className="bg-blue-950/50 p-1 w-full">
                        <TabsTrigger
                          value="all-levels"
                          className={`flex-1 ${selectedLevel === 'all' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedLevel('all')}
                        >
                          Tous
                        </TabsTrigger>
                        <TabsTrigger
                          value="débutant"
                          className={`flex-1 ${selectedLevel === 'débutant' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedLevel('débutant')}
                        >
                          Débutant
                        </TabsTrigger>
                        <TabsTrigger
                          value="intermédiaire"
                          className={`flex-1 ${selectedLevel === 'intermédiaire' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedLevel('intermédiaire')}
                        >
                          Intermédiaire
                        </TabsTrigger>
                        <TabsTrigger
                          value="avancé"
                          className={`flex-1 ${selectedLevel === 'avancé' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSelectedLevel('avancé')}
                        >
                          Avancé
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Tri */}
                    <div>
                      <label className="block text-sm font-medium text-blue-300 mb-1">Trier par</label>
                      <TabsList className="bg-blue-950/50 p-1 w-full">
                        <TabsTrigger
                          value="recent"
                          className={`flex-1 ${sortOrder === 'recent' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSortOrder('recent')}
                        >
                          Récent
                        </TabsTrigger>
                        <TabsTrigger
                          value="alphabetical"
                          className={`flex-1 ${sortOrder === 'alphabetical' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSortOrder('alphabetical')}
                        >
                          A-Z
                        </TabsTrigger>
                        <TabsTrigger
                          value="level"
                          className={`flex-1 ${sortOrder === 'level' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSortOrder('level')}
                        >
                          Niveau
                        </TabsTrigger>
                        <TabsTrigger
                          value="favorites"
                          className={`flex-1 ${sortOrder === 'favorites' ? 'bg-blue-800 text-white' : 'text-blue-400 hover:text-blue-300'}`}
                          onClick={() => setSortOrder('favorites')}
                        >
                          Favoris
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Génération de fiche avec IA */}
            <Card className="bg-gradient-to-br from-blue-900/40 to-blue-950 border-blue-800/40">
              <CardContent className="p-4">
                <h3 className="font-medium text-blue-300 mb-2">Générer une nouvelle fiche</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Décrivez le sujet de cybersécurité..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isGenerating}
                    className="bg-blue-900/20 border-blue-800/50 focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                  
                  {isGenerating ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-blue-300">
                        <span>Génération en cours...</span>
                        <span>{timeRemaining}s</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-blue-900/30" indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-500" />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={cancelGeneration}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500"
                      onClick={startGeneratingFiche}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer avec IA
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Liste des fiches */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-blue-300">Fiches disponibles</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-700 text-blue-400 hover:bg-blue-900/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    Importer
                  </Button>
                </div>
              </div>

              {filteredFiches.length === 0 ? (
                <div className="bg-blue-900/20 rounded-lg p-4 text-center text-gray-400">
                  Aucune fiche ne correspond à vos critères
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedFiches.map((fiche) => (
                    <motion.div
                      key={fiche.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedFiche?.id === fiche.id 
                            ? 'bg-blue-800/40 border-blue-700' 
                            : 'bg-blue-900/20 border-blue-800/40 hover:bg-blue-800/30'
                        }`}
                        onClick={() => {
                          setSelectedFiche(fiche);
                          markAsRead(fiche.id);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              fiche.category === 'menaces' ? 'bg-red-900/30 text-red-400' :
                              fiche.category === 'architecture' ? 'bg-blue-900/30 text-blue-400' :
                              fiche.category === 'vulnérabilités' ? 'bg-amber-900/30 text-amber-400' :
                              fiche.category === 'identité' ? 'bg-indigo-900/30 text-indigo-400' :
                              fiche.category === 'détection' ? 'bg-purple-900/30 text-purple-400' :
                              'bg-green-900/30 text-green-400'
                            }`}>
                              {fiche.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <h4 className="font-medium text-blue-200 truncate">{fiche.title}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-6 w-6 ${fiche.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(fiche.id);
                                  }}
                                >
                                  <Star className="h-4 w-4" fill={fiche.isFavorite ? "currentColor" : "none"} />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-400 truncate">{fiche.description}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-blue-800 text-blue-300">
                                  {fiche.category}
                                </Badge>
                                <Badge variant="outline" className={`text-xs border-blue-800 ${
                                  fiche.level === 'débutant' ? 'text-green-400' :
                                  fiche.level === 'intermédiaire' ? 'text-amber-400' :
                                  'text-red-400'
                                }`}>
                                  {fiche.level}
                                </Badge>
                                {fiche.hasBeenRead && (
                                  <Badge className="text-xs bg-blue-700/30 text-blue-300">
                                    Lu
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panneau de droite : Contenu de la fiche sélectionnée */}
          <div className="lg:col-span-2 space-y-4">
            {selectedFiche ? (
              <div className="space-y-4">
                <Card className="bg-blue-900/20 border-blue-800/40">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          selectedFiche.category === 'menaces' ? 'bg-red-900/30 text-red-400' :
                          selectedFiche.category === 'architecture' ? 'bg-blue-900/30 text-blue-400' :
                          selectedFiche.category === 'vulnérabilités' ? 'bg-amber-900/30 text-amber-400' :
                          selectedFiche.category === 'identité' ? 'bg-indigo-900/30 text-indigo-400' :
                          selectedFiche.category === 'détection' ? 'bg-purple-900/30 text-purple-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {selectedFiche.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-blue-300">{selectedFiche.title}</h2>
                          <p className="text-gray-400">{selectedFiche.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`border-blue-700 ${selectedFiche.isFavorite ? 'text-yellow-400' : 'text-blue-400 hover:text-yellow-400'}`}
                          onClick={() => toggleFavorite(selectedFiche.id)}
                        >
                          <Star className="h-5 w-5" fill={selectedFiche.isFavorite ? "currentColor" : "none"} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-700 text-blue-400 hover:text-blue-300"
                          onClick={() => exportFiche(selectedFiche)}
                        >
                          <Download className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-700 text-red-400 hover:text-red-300 hover:border-red-700"
                          onClick={() => deleteFiche(selectedFiche.id)}
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="col-span-1 bg-blue-950/40 rounded-lg p-3">
                        <div className="text-sm text-blue-400 mb-1">Catégorie</div>
                        <div className="capitalize font-medium text-white">
                          {selectedFiche.category}
                        </div>
                      </div>
                      <div className="col-span-1 bg-blue-950/40 rounded-lg p-3">
                        <div className="text-sm text-blue-400 mb-1">Niveau</div>
                        <div className="capitalize font-medium text-white">
                          {selectedFiche.level}
                        </div>
                      </div>
                      <div className="col-span-1 bg-blue-950/40 rounded-lg p-3">
                        <div className="text-sm text-blue-400 mb-1">Points clés</div>
                        <div className="font-medium text-white">
                          {selectedFiche.keyPoints.length} points
                        </div>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="content" className="w-full">
                      <TabsList className="bg-blue-950/50 p-1 mb-6">
                        <TabsTrigger value="content" className="flex-1 text-blue-400 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                          <FileText className="h-4 w-4 mr-2" />
                          Contenu complet
                        </TabsTrigger>
                        <TabsTrigger value="key-points" className="flex-1 text-blue-400 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Points clés
                        </TabsTrigger>
                        <TabsTrigger value="references" className="flex-1 text-blue-400 data-[state=active]:bg-blue-800 data-[state=active]:text-white">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Références
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="content" className="m-0">
                        <div className="prose prose-invert prose-blue max-w-none">
                          {selectedFiche.content.split('\n').map((line, index) => {
                            if (line.startsWith('## ')) {
                              return <h2 key={index} className="text-xl font-bold text-blue-300 mt-6 mb-3">{line.substring(3)}</h2>;
                            } else if (line.startsWith('### ')) {
                              return <h3 key={index} className="text-lg font-bold text-blue-400 mt-5 mb-2">{line.substring(4)}</h3>;
                            } else if (line.startsWith('- ')) {
                              return <div key={index} className="flex items-start mb-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-2"></div>
                                <p className="text-gray-300">{line.substring(2)}</p>
                              </div>;
                            } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                              const num = line.substring(0, line.indexOf('.'));
                              return <div key={index} className="flex items-start mb-1.5">
                                <div className="bg-blue-900/50 h-5 w-5 rounded-full flex items-center justify-center text-xs text-blue-300 mr-2 mt-0.5">{num}</div>
                                <p className="text-gray-300">{line.substring(line.indexOf('.') + 2)}</p>
                              </div>;
                            } else if (line.trim() === '') {
                              return <div key={index} className="h-4"></div>;
                            } else {
                              return <p key={index} className="text-gray-300 mb-2">{line}</p>;
                            }
                          })}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="key-points" className="m-0">
                        <div className="space-y-3">
                          {selectedFiche.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start bg-blue-900/20 rounded-lg p-3">
                              <div className="bg-blue-800/50 h-6 w-6 rounded-full flex items-center justify-center text-sm text-blue-300 mr-3 mt-0.5">
                                {index + 1}
                              </div>
                              <p className="text-gray-300">{point}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="references" className="m-0">
                        <div className="space-y-3">
                          {selectedFiche.references.map((reference, index) => (
                            <div key={index} className="flex items-start">
                              <BookOpen className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                              <p className="text-gray-300">{reference}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-blue-900/20 border border-blue-800/40 rounded-lg p-12 text-center">
                <div className="p-4 rounded-full bg-blue-900/40 text-blue-400 mb-4">
                  <FileText className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-medium text-blue-300 mb-2">Sélectionnez une fiche</h3>
                <p className="text-gray-400 max-w-md">
                  Choisissez une fiche dans la liste de gauche ou générez-en une nouvelle avec l'assistant IA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}