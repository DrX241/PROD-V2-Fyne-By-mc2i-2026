import React, { useState, useEffect } from 'react';
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
  BrainCircuit
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
        'Les ransomwares chiffrent les données et exigent une rançon pour les déchiffrer',
        'La double extorsion combine chiffrement et menace de publication des données',
        'Le phishing est le principal vecteur d'infection',
        'Les sauvegardes régulières non connectées sont la meilleure protection',
        'Ne jamais payer la rançon sans avoir consulté des experts en cybersécurité'
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
        'Zero Trust repose sur le principe "ne jamais faire confiance, toujours vérifier"',
        'L\'authentification et l\'autorisation sont requises pour tous, partout',
        'L\'accès aux ressources est limité au strict minimum nécessaire',
        'La surveillance continue et l\'analyse comportementale sont essentielles',
        'Zero Trust est une stratégie, pas un produit ou une technologie unique'
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
        'Le XSS permet l\'injection de scripts malveillants dans les pages web vues par d\'autres utilisateurs',
        'Les trois principaux types sont: réfléchi, stocké et basé sur le DOM',
        'Les conséquences incluent le vol de session, le détournement de compte et le vol de données',
        'La validation des entrées et l\'échappement des sorties sont essentiels',
        'Content Security Policy (CSP) est une protection efficace contre le XSS'
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
        'Le MFA combine au moins deux facteurs d\'authentification distincts',
        'Les trois catégories de facteurs sont : connaissance, possession et inhérence',
        'Les applications d\'authentification sont préférables aux SMS',
        'Les clés de sécurité physiques offrent le plus haut niveau de protection',
        'Le MFA réduit drastiquement le risque de compromission de compte'
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
- Amélioration des capacités de détection
- Ajustement des hypothèses pour les futures chasses

## Technologies et outils

- SIEM (Security Information and Event Management)
- EDR/XDR (Endpoint/Extended Detection and Response)
- UEBA (User and Entity Behavior Analytics)
- Forensics et analyse de mémoire
- Threat Intelligence Platforms
- Langages d'analyse (Python, PowerShell, EQL)
      `,
      keyPoints: [
        'Le Threat Hunting est une approche proactive pour découvrir les menaces non détectées',
        'Il repose sur des hypothèses basées sur les techniques connues des attaquants',
        'La méthodologie inclut préparation, hypothèses, collecte de données, investigation et réponse',
        'Le framework MITRE ATT&CK est un outil essentiel pour structurer la chasse',
        'L\'automatisation des découvertes améliore les défenses pour l\'avenir'
      ],
      references: [
        'SANS Institute - Effective Threat Hunting',
        'MITRE ATT&CK Framework',
        'Sqrrl (IBM) - A Framework for Cyber Threat Hunting'
      ],
      icon: <Zap />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'data-leakage',
      title: 'Prévention des fuites de données (DLP)',
      category: 'données',
      level: 'intermédiaire',
      description: 'Stratégies et outils pour prévenir les fuites de données sensibles',
      content: `
## Qu'est-ce que la prévention des fuites de données (DLP) ?

La prévention des fuites de données (Data Leakage Prevention ou DLP) désigne l'ensemble des stratégies, processus et outils visant à détecter et prévenir la divulgation non autorisée de données sensibles en dehors de l'organisation, qu'elle soit accidentelle ou intentionnelle.

## Types de données à protéger

1. **Données personnelles** (PII - Personally Identifiable Information)
   - Noms, adresses, numéros de téléphone
   - Numéros de sécurité sociale, passeports, permis de conduire
   - Informations financières (numéros de carte bancaire, comptes)

2. **Données de santé** (PHI - Protected Health Information)
   - Dossiers médicaux
   - Historiques de traitement
   - Informations d'assurance santé

3. **Propriété intellectuelle**
   - Secrets commerciaux
   - Code source
   - Documents de conception
   - Brevets non déposés

4. **Données de conformité**
   - Informations financières et réglementaires
   - Données soumises aux réglementations sectorielles

## Principales sources de fuites de données

1. **Email et messagerie instantanée**
   - Pièces jointes contenant des données sensibles
   - Destinataires incorrects par erreur d'adressage

2. **Stockage cloud et partage de fichiers**
   - Paramètres de partage trop permissifs
   - Liens de partage publics

3. **Dispositifs mobiles et supports amovibles**
   - Téléphones, tablettes, ordinateurs portables
   - Clés USB, disques externes

4. **Applications web et SaaS**
   - Téléchargements et transferts non contrôlés
   - Intégrations et API tierces

5. **Impression et numérisation**
   - Documents abandonnés sur les imprimantes
   - Transmission non sécurisée vers/depuis les imprimantes réseau

## Composants d'une solution DLP

1. **DLP au niveau du réseau**
   - Surveillance du trafic entrant et sortant
   - Inspection des protocoles (HTTP, SMTP, FTP)
   - Analyse des flux de données non structurées

2. **DLP au niveau des terminaux**
   - Contrôle des périphériques USB et supports amovibles
   - Surveillance des opérations de copier-coller
   - Chiffrement des données sur les appareils

3. **DLP au niveau du stockage**
   - Découverte et classification des données sensibles
   - Contrôles d'accès basés sur la classification
   - Surveillance des mouvements de données

4. **DLP au niveau des applications**
   - Filtrage des emails et pièces jointes
   - Contrôle des téléchargements et partages cloud
   - Inspection du contenu des messages

## Bonnes pratiques pour l'implémentation de DLP

1. **Classification des données**
   - Établir une taxonomie des données claire
   - Définir les niveaux de sensibilité
   - Mettre en place un étiquetage automatique

2. **Politiques et règles**
   - Définir des règles basées sur les contextes d'utilisation
   - Adapter les contrôles au niveau de risque
   - Équilibrer sécurité et facilité d'utilisation

3. **Formation et sensibilisation**
   - Former les employés aux risques de fuites de données
   - Expliquer les raisons des contrôles DLP
   - Encourager les bonnes pratiques

4. **Surveillance et réponse**
   - Mettre en place des alertes en temps réel
   - Définir des workflows d'incident
   - Analyser les tendances pour améliorer les contrôles
      `,
      keyPoints: [
        'Le DLP vise à prévenir la divulgation non autorisée de données sensibles',
        'Les solutions DLP opèrent au niveau du réseau, des terminaux, du stockage et des applications',
        'La classification des données est un prérequis essentiel à une stratégie DLP efficace',
        'L\'équilibre entre sécurité et productivité des utilisateurs est crucial',
        'Le facteur humain reste le maillon le plus important pour prévenir les fuites'
      ],
      references: [
        'NIST SP 800-53 Rev. 5 - Security and Privacy Controls',
        'ISO/IEC 27001 - Information Security Management',
        'SANS Institute - Data Leakage Prevention'
      ],
      icon: <Database />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'supply-chain',
      title: 'Sécurité de la chaîne d\'approvisionnement',
      category: 'risques',
      level: 'avancé',
      description: 'Gérer les risques liés à la chaîne d\'approvisionnement digitale',
      content: `
## La sécurité de la chaîne d'approvisionnement numérique

La sécurité de la chaîne d'approvisionnement numérique concerne l'ensemble des mesures visant à protéger les processus, fournisseurs, technologies et informations impliqués dans la livraison de produits et services. Les attaques sur la chaîne d'approvisionnement ont augmenté significativement, comme l'ont démontré les incidents SolarWinds, Kaseya, et Log4j.

## Vecteurs d'attaque courants

1. **Compromission de logiciels tiers**
   - Infiltration du code source ou des pipelines CI/CD
   - Insertion de portes dérobées dans les mises à jour
   - Détournement de dépendances et de packages

2. **Vulnérabilités des sous-traitants**
   - Accès privilégiés aux systèmes du client
   - Standards de sécurité insuffisants
   - Compromission de leurs environnements

3. **Composants matériels compromis**
   - Insertion de backdoors ou de circuits malveillants
   - Falsification du firmware
   - Substitution de composants authentiques

4. **Dépendances open-source vulnérables**
   - Composants non maintenus ou obsolètes
   - Vulnérabilités connues non corrigées
   - Typosquatting et dependency confusion

## Stratégies de protection

### 1. Évaluation des risques et due diligence

- Classement des fournisseurs par niveau de risque
- Évaluation des pratiques de sécurité des fournisseurs
- Audits de sécurité et tests d'intrusion
- Vérification des certifications de sécurité (ISO 27001, SOC 2)

### 2. Exigences contractuelles

- Clauses de sécurité dans les contrats
- Niveaux de service pour les correctifs de sécurité
- Obligations de notification en cas d'incident
- Droit d'audit et de vérification

### 3. Sécurisation du code et des dépendances

- Scanning automatisé des vulnérabilités
- Analyse de la composition des logiciels (SCA)
- Validation cryptographique des artefacts
- Mise en place de SBOM (Software Bill of Materials)

### 4. Contrôle des accès des fournisseurs

- Principe du moindre privilège
- Accès limités dans le temps et surveillés
- Authentification multifacteur obligatoire
- Séparation des environnements

### 5. Surveillance continue

- Détection des comportements anormaux
- Validation de l'intégrité des mises à jour
- Scanning continu des vulnérabilités
- Intelligence sur les menaces spécifiques

## Cadres et standards

- NIST 800-161 - Supply Chain Risk Management
- ISO 28000 - Security Management Systems for the Supply Chain
- SLSA (Supply-chain Levels for Software Artifacts)
- SSDF (Secure Software Development Framework)
      `,
      keyPoints: [
        'Les attaques sur la chaîne d\'approvisionnement exploitent la confiance entre organisations',
        'L\'incident SolarWinds a démontré l\'impact critique de ces attaques',
        'La due diligence des fournisseurs est essentielle mais insuffisante seule',
        'Les SBOM (Software Bill of Materials) deviennent un standard de transparence',
        'La surveillance continue et la vérification d\'intégrité sont indispensables'
      ],
      references: [
        'NIST SP 800-161 Rev. 1 - Cybersecurity Supply Chain Risk Management',
        'ENISA - Threat Landscape for Supply Chain Attacks',
        'CISA - ICT Supply Chain Risk Management Task Force'
      ],
      icon: <Network />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'ztna',
      title: 'Zero Trust Network Access (ZTNA)',
      category: 'architecture',
      level: 'intermédiaire',
      description: 'Principes et mise en œuvre de l\'accès réseau Zero Trust',
      content: `
## Qu'est-ce que le Zero Trust Network Access (ZTNA) ?

Le Zero Trust Network Access (ZTNA) est une technologie de sécurité qui fournit un accès sécurisé aux applications et services basé sur des politiques définies, indépendamment de l'emplacement réseau des utilisateurs. Contrairement aux VPN traditionnels qui accordent un accès large au réseau une fois l'authentification effectuée, le ZTNA applique le modèle Zero Trust en vérifiant continuellement l'identité, le contexte et la conformité avant d'accorder un accès spécifique à une application.

## Principes fondamentaux du ZTNA

1. **Accès basé sur l'identité** : L'identité de l'utilisateur devient le nouveau périmètre de sécurité
2. **Accès minimal** : Uniquement aux applications spécifiques, pas à l'ensemble du réseau
3. **Vérification continue** : Authentification et autorisation permanentes, pas seulement à la connexion
4. **Visibilité et analyse** : Surveillance détaillée de tous les accès et comportements

## Architecture typique d'une solution ZTNA

### Composants principaux

1. **Client ZTNA** : Agent sur l'appareil de l'utilisateur ou service proxy sans agent
2. **Service d'authentification** : Validation de l'identité et contrôle des accès
3. **Plan de contrôle** : Gestion des politiques et orchestration
4. **Connecteurs/passerelles** : Points de connexion aux applications internes
5. **Moteur de politiques** : Application des décisions d'autorisation basées sur le contexte

### Flux typique d'accès

1. L'utilisateur s'authentifie via une solution d'identité intégrée (généralement avec MFA)
2. Le plan de contrôle vérifie l'identité, l'état de l'appareil et d'autres attributs contextuels
3. Si autorisé, une connexion sécurisée spécifique à l'application est établie
4. La connexion reste surveillée et peut être interrompue si le contexte change
5. Les applications restent invisibles depuis Internet, sans exposition directe

## Modèles de déploiement

1. **ZTNA géré en interne**
   - Infrastructure déployée et gérée par l'organisation
   - Contrôle total des politiques et de la configuration
   - Nécessite des ressources pour la maintenance

2. **ZTNA as a Service**
   - Fourni par un prestataire cloud
   - Déploiement simplifié et évolutivité
   - Dépendance envers le fournisseur de service

3. **Approche hybride**
   - Combinaison de composants internes et services cloud
   - Flexibilité pour les environnements complexes

## Comparaison avec les VPN traditionnels

| Aspect | VPN traditionnel | ZTNA |
|--------|------------------|------|
| Modèle d'accès | Accès au réseau complet | Accès spécifique aux applications |
| Visibilité | Limitée après connexion | Surveillance continue |
| Expérience utilisateur | Souvent complexe, latence | Transparent, meilleure performance |
| Protection contre les mouvements latéraux | Limitée | Forte segmentation |
| Évolutivité | Généralement limitée | Hautement évolutif |

## Considérations pour l'implémentation

1. **Inventaire des applications** : Cartographier toutes les applications internes et leurs utilisateurs
2. **Politiques d'accès** : Définir des règles basées sur l'identité, le contexte et les comportements
3. **Intégration IdP** : Assurer une forte intégration avec les fournisseurs d'identité existants
4. **Gestion des appareils** : Définir les critères de conformité des appareils
5. **Surveillance** : Mettre en place une surveillance complète pour détecter les anomalies
      `,
      keyPoints: [
        'Le ZTNA fournit un accès granulaire aux applications sans exposer le réseau sous-jacent',
        'Les connexions sont spécifiques à l\'application et non au réseau entier',
        'L\'accès est basé sur l\'identité, le contexte et l\'état de sécurité de l\'appareil',
        'Le ZTNA remplace progressivement les VPN traditionnels pour l\'accès à distance',
        'La visibilité et la surveillance continues sont des avantages majeurs'
      ],
      references: [
        'Gartner - Market Guide for Zero Trust Network Access',
        'NIST SP 800-207 - Zero Trust Architecture',
        'CSA - Software Defined Perimeter Architecture Guide'
      ],
      icon: <Server />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'IA-securite',
      title: 'IA et cybersécurité : opportunités et risques',
      category: 'technologies',
      level: 'tous niveaux',
      description: 'Impact de l\'intelligence artificielle sur le paysage des menaces et des défenses',
      content: `
## L'intelligence artificielle en cybersécurité

L'intelligence artificielle (IA) transforme profondément le domaine de la cybersécurité. Elle offre de nouvelles capacités aux défenseurs, mais également aux attaquants, créant un nouveau paradigme dans la course aux armements cyber. Cette fiche présente les principaux usages, bénéfices et risques associés à l'IA dans ce contexte.

## Applications défensives de l'IA

### 1. Détection avancée des menaces
- **Détection d'anomalies** : Identification de comportements inhabituels non détectables par des règles statiques
- **Analyse comportementale** : Modélisation du comportement normal des utilisateurs et systèmes
- **Détection de malwares inconnus** : Identification de logiciels malveillants sans signatures connues

### 2. Automatisation de la réponse
- **Orchestration des actions de réponse** : Automatisation des workflows de remédiation
- **Triage des alertes** : Priorisation intelligente des incidents à traiter
- **Réponse adaptative** : Ajustement dynamique des contrôles de sécurité

### 3. Analyse prédictive
- **Anticipation des vulnérabilités** : Prédiction des failles potentielles
- **Modélisation des risques** : Évaluation dynamique de l'exposition aux menaces
- **Threat Intelligence** : Analyse automatisée des sources de renseignement

## Usages offensifs de l'IA

### 1. Amélioration des attaques sociales
- **Phishing personnalisé à grande échelle** : Adaptation du contenu selon les cibles
- **Deepfakes** : Création de contenu audio et vidéo frauduleux réaliste
- **Usurpation d'identité** : Imitation du style d'écriture ou de la voix

### 2. Automatisation des attaques techniques
- **Découverte de vulnérabilités** : Analyse automatisée de code et de systèmes
- **Contournement des défenses** : Adaptation aux mesures de protection
- **Attaques persistantes** : Maintien de l'accès malgré les détections

### 3. Évolution des malwares
- **Polymorphisme avancé** : Modification constante pour éviter la détection
- **Comportement adaptatif** : Ajustement selon l'environnement détecté
- **Ciblage intelligent** : Sélection précise des victimes les plus vulnérables

## Défis et considérations

### 1. Défis techniques
- **Faux positifs** : Équilibre entre sensibilité et précision des alertes
- **Explicabilité** : Compréhension des décisions prises par l'IA
- **Robustesse** : Résistance aux tentatives de manipulation des modèles

### 2. Défis organisationnels
- **Compétences requises** : Besoin d'expertise en IA et en cybersécurité
- **Intégration** : Incorporation dans les processus de sécurité existants
- **Gouvernance** : Supervision humaine appropriée des systèmes automatisés

### 3. Considérations éthiques
- **Surveillance** : Équilibre entre détection et respect de la vie privée
- **Biais algorithmiques** : Risque de discrimination ou d'inégalités
- **Autonomie des systèmes** : Limites appropriées à l'automatisation
      `,
      keyPoints: [
        'L\'IA transforme à la fois les capacités offensives et défensives en cybersécurité',
        'Les capacités défensives incluent la détection d\'anomalies, l\'automatisation et l\'analyse prédictive',
        'Les risques offensifs concernent le phishing avancé, les deepfakes et les malwares adaptatifs',
        'L\'explicabilité des décisions prises par l\'IA reste un défi majeur',
        'La supervision humaine appropriée demeure essentielle malgré l\'automatisation'
      ],
      references: [
        'ENISA - Artificial Intelligence Cybersecurity Challenges',
        'NIST IR 8269 - A Taxonomy and Terminology of Adversarial Machine Learning',
        'MITRE ATLAS - Adversarial Threat Landscape for AI Systems'
      ],
      icon: <BrainCircuit />,
      isFavorite: false,
      hasBeenRead: false
    }
  ];

  // Initialisation des fiches
  useEffect(() => {
    // Simuler le chargement des fiches depuis une API
    setFiches(demoFiches);
    
    // Charger les fiches favorites et lues depuis le localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('cyberfichesFavorites') || '[]');
    const storedRead = JSON.parse(localStorage.getItem('cyberfichesRead') || '[]');
    
    if (storedFavorites.length > 0 || storedRead.length > 0) {
      const updatedFiches = demoFiches.map(fiche => ({
        ...fiche,
        isFavorite: storedFavorites.includes(fiche.id),
        hasBeenRead: storedRead.includes(fiche.id)
      }));
      
      setFiches(updatedFiches);
      setFavoriteCount(storedFavorites.length);
      setReadCount(storedRead.length);
    }
    
    // Initialiser la progression
    const readProgress = (storedRead.length / demoFiches.length) * 100;
    setProgress(readProgress);
  }, []);

  // Filtrage des fiches
  const getFilteredFiches = () => {
    return fiches.filter(fiche => {
      const matchesSearch = searchTerm === '' || 
        fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fiche.keyPoints.some(point => point.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || fiche.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || fiche.level === selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  };
  
  // Tri des fiches
  const getSortedFiches = () => {
    const filtered = getFilteredFiches();
    
    switch (sortOrder) {
      case 'alphabetical':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case 'level':
        const levelOrder = { 'débutant': 1, 'intermédiaire': 2, 'avancé': 3, 'tous niveaux': 4 };
        return [...filtered].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
      case 'favorite':
        return [...filtered].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
      case 'recent':
      default:
        return filtered;
    }
  };

  // Gestion des favoris
  const toggleFavorite = (id: string) => {
    const updatedFiches = fiches.map(fiche => 
      fiche.id === id ? {...fiche, isFavorite: !fiche.isFavorite} : fiche
    );
    
    setFiches(updatedFiches);
    
    const favorites = updatedFiches.filter(f => f.isFavorite).map(f => f.id);
    localStorage.setItem('cyberfichesFavorites', JSON.stringify(favorites));
    setFavoriteCount(favorites.length);
    
    toast({
      title: updatedFiches.find(f => f.id === id)?.isFavorite 
        ? "Fiche ajoutée aux favoris" 
        : "Fiche retirée des favoris",
      variant: "default",
    });
  };
  
  // Marquer comme lu
  const markAsRead = (id: string) => {
    const updatedFiches = fiches.map(fiche => 
      fiche.id === id ? {...fiche, hasBeenRead: true} : fiche
    );
    
    setFiches(updatedFiches);
    
    const read = updatedFiches.filter(f => f.hasBeenRead).map(f => f.id);
    localStorage.setItem('cyberfichesRead', JSON.stringify(read));
    setReadCount(read.length);
    
    // Mettre à jour la progression
    const readProgress = (read.length / fiches.length) * 100;
    setProgress(readProgress);
    
    toast({
      title: "Fiche marquée comme lue",
      description: "Votre progression a été mise à jour",
      variant: "default",
    });
  };
  
  // Téléchargement de la fiche
  const downloadFiche = (fiche: FicheCyber) => {
    // Formatage du contenu pour PDF
    const content = `
# ${fiche.title}
## ${fiche.description}

${fiche.content}

## Points clés
${fiche.keyPoints.map(point => `- ${point}`).join('\n')}

## Références
${fiche.references.map(ref => `- ${ref}`).join('\n')}
    `;
    
    // Création d'un Blob pour le téléchargement
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Création d'un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fiche.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Fiche téléchargée",
      description: `${fiche.title} a été téléchargée au format Markdown`,
      variant: "default",
    });
  };
  
  // Génération d'une fiche par IA
  const generateFiche = () => {
    if (aiPrompt.trim() === '') {
      toast({
        title: "Veuillez spécifier un sujet",
        description: "Pour générer une fiche, nous avons besoin d'un sujet de cybersécurité",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simuler un délai de génération
    setTimeout(() => {
      // Création d'une nouvelle fiche
      const newFiche: FicheCyber = {
        id: `generated-${Date.now()}`,
        title: `Fiche personnalisée: ${aiPrompt}`,
        category: 'personnalisé',
        level: 'tous niveaux',
        description: `Fiche générée par IA sur le sujet: ${aiPrompt}`,
        content: `# ${aiPrompt}\n\nContenu de la fiche en cours de génération...\n\nCette fiche sera complétée avec un contenu détaillé sur le sujet demandé.`,
        keyPoints: ['Point clé 1', 'Point clé 2', 'Point clé 3'],
        references: ['Source 1', 'Source 2'],
        icon: <BrainCircuit />,
        isFavorite: false,
        hasBeenRead: false
      };
      
      // Ajout de la nouvelle fiche
      setFiches([newFiche, ...fiches]);
      setIsGenerating(false);
      setAiPrompt('');
      
      toast({
        title: "Fiche générée avec succès",
        description: "Une nouvelle fiche personnalisée a été créée",
        variant: "default"
      });
      
      // Sélectionner automatiquement la nouvelle fiche
      setSelectedFiche(newFiche);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="CYBER ACADÉMIE" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="mr-3 h-6 w-6 text-amber-400" />
              Fiches Cyber Express
            </h1>
            <p className="text-blue-200 mt-1">Synthèses rapides des concepts clés en cybersécurité</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-amber-500 text-amber-200 hover:bg-amber-800/30"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres {showFilters ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-amber-300" />
              <Input 
                placeholder="Rechercher par titre, description ou mot-clé..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-amber-950/40 border-amber-700/50 text-white placeholder:text-amber-300/70"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Badge className="bg-amber-600 hover:bg-amber-500 cursor-pointer" onClick={() => setSelectedCategory('all')}>
                {fiches.length} fiches
              </Badge>
              
              <Badge variant="outline" className="border-amber-500 text-amber-300 hover:bg-amber-800/50 cursor-pointer">
                <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                {favoriteCount} favoris
              </Badge>
              
              <Badge variant="outline" className="border-amber-500 text-amber-300 hover:bg-amber-800/50 cursor-pointer">
                <BookOpen className="mr-1 h-3 w-3" />
                {readCount} lues
              </Badge>
            </div>
          </div>
          
          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-amber-700/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-amber-200 mb-1 block">Catégorie</label>
                    <select 
                      className="w-full bg-amber-950/40 border-amber-700/50 text-white rounded-md p-2"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">Toutes les catégories</option>
                      <option value="menaces">Menaces</option>
                      <option value="architecture">Architecture</option>
                      <option value="vulnérabilités">Vulnérabilités</option>
                      <option value="identité">Identité</option>
                      <option value="données">Données</option>
                      <option value="risques">Risques</option>
                      <option value="détection">Détection</option>
                      <option value="technologies">Technologies</option>
                      <option value="personnalisé">Fiches personnalisées</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-amber-200 mb-1 block">Niveau</label>
                    <select 
                      className="w-full bg-amber-950/40 border-amber-700/50 text-white rounded-md p-2"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                      <option value="all">Tous les niveaux</option>
                      <option value="débutant">Débutant</option>
                      <option value="intermédiaire">Intermédiaire</option>
                      <option value="avancé">Avancé</option>
                      <option value="tous niveaux">Tous niveaux</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-amber-200 mb-1 block">Tri</label>
                    <select 
                      className="w-full bg-amber-950/40 border-amber-700/50 text-white rounded-md p-2"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="recent">Plus récents</option>
                      <option value="alphabetical">Alphabétique</option>
                      <option value="level">Par niveau</option>
                      <option value="favorite">Favoris en premier</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Section de génération par IA */}
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5 text-blue-300" />
            Générer une fiche personnalisée
          </h2>
          
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Entrez un sujet de cybersécurité (ex: 'Attaques par canal auxiliaire', 'Sécurité des IoT'...)"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-grow bg-blue-950/40 border-blue-700/50 text-white placeholder:text-blue-300/70"
            />
            
            <Button 
              onClick={generateFiche} 
              disabled={isGenerating || aiPrompt.trim() === ''}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 whitespace-nowrap"
            >
              {isGenerating ? 'Génération...' : 'Générer une fiche'}
              <BrainCircuit className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-blue-300 mt-2">
            Notre IA peut générer une fiche personnalisée sur n'importe quel sujet de cybersécurité. 
            Entrez simplement le thème qui vous intéresse.
          </p>
        </div>
        
        {/* Progression générale */}
        <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Votre progression</h2>
            <span className="text-sm text-blue-200">{readCount}/{fiches.length} fiches lues</span>
          </div>
          <Progress value={progress} className="h-2 bg-blue-950" indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6">
        <Tabs defaultValue="liste" className="space-y-6">
          <TabsList className="bg-amber-900/20 border border-amber-800">
            <TabsTrigger value="liste" className="data-[state=active]:bg-amber-700">
              Liste des fiches
            </TabsTrigger>
            <TabsTrigger value="favoris" className="data-[state=active]:bg-amber-700">
              Favoris
            </TabsTrigger>
            <TabsTrigger value="recents" className="data-[state=active]:bg-amber-700">
              Récemment consultés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="liste" className="space-y-6">
            {selectedFiche ? (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="ghost" onClick={() => setSelectedFiche(null)}>
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour aux fiches
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleFavorite(selectedFiche.id)}
                      className={`border-amber-500 ${selectedFiche.isFavorite ? 'bg-amber-900/50' : ''}`}
                    >
                      <Star className={`mr-2 h-4 w-4 ${selectedFiche.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                      {selectedFiche.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadFiche(selectedFiche)}
                      className="border-amber-500"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                
                <div className="bg-amber-900/10 border border-amber-800/50 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-amber-800/70 rounded-md">
                      {selectedFiche.icon}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{selectedFiche.title}</h1>
                      <p className="text-amber-200 mt-1">{selectedFiche.description}</p>
                      
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-amber-700">
                          {selectedFiche.category}
                        </Badge>
                        <Badge variant="outline" className="border-amber-600 text-amber-200">
                          {selectedFiche.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert prose-amber max-w-none mt-6">
                    <div dangerouslySetInnerHTML={{ 
                      __html: selectedFiche.content
                        .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold text-amber-300 mt-6 mb-3">$1</h2>')
                        .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold text-amber-200 mt-4 mb-2">$1</h3>')
                        .replace(/^- (.*?)$/gm, '<li class="mb-1">$1</li>')
                        .replace(/^\d+\. (.*?)$/gm, '<li class="mb-1">$1</li>')
                        .split('\n\n').join('<p class="mb-4"></p>')
                    }} />
                  </div>
                  
                  <div className="mt-8 bg-amber-950/30 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-300 mb-2">Points clés</h3>
                    <ul className="space-y-2">
                      {selectedFiche.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="min-w-4 pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1"></div>
                          </div>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-amber-300 mb-2">Références</h3>
                    <ul className="space-y-1 text-sm text-amber-200">
                      {selectedFiche.references.map((ref, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="min-w-4 pt-1">
                            <div className="w-1 h-1 rounded-full bg-amber-400 mt-1"></div>
                          </div>
                          <span>{ref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    {!selectedFiche.hasBeenRead && (
                      <Button 
                        onClick={() => markAsRead(selectedFiche.id)}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSortedFiches().map((fiche) => (
                  <Card 
                    key={fiche.id} 
                    className={`bg-gradient-to-b from-amber-900/20 to-orange-900/10 hover:from-amber-900/30 hover:to-orange-900/20 border-amber-800/50 transition-all cursor-pointer overflow-hidden`}
                    onClick={() => {
                      setSelectedFiche(fiche);
                      // Si la fiche n'a pas encore été consultée, on stocke la date de consultation
                      if (!localStorage.getItem(`cyberfiche_${fiche.id}_lastViewed`)) {
                        localStorage.setItem(`cyberfiche_${fiche.id}_lastViewed`, new Date().toISOString());
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-amber-800/70 rounded-md">
                          {fiche.icon}
                        </div>
                        <div className="flex gap-1">
                          {fiche.isFavorite && (
                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                          )}
                          {fiche.hasBeenRead && (
                            <Badge className="bg-green-700">Lu</Badge>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-bold mt-3 text-lg">{fiche.title}</h3>
                      <p className="text-sm text-amber-200 mt-1">{fiche.description}</p>
                      
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-amber-700">
                          {fiche.category}
                        </Badge>
                        <Badge variant="outline" className="border-amber-600 text-amber-200">
                          {fiche.level}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 text-sm">
                        <p className="text-amber-300">Points clés: {fiche.keyPoints.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favoris" className="space-y-6">
            {fiches.filter(f => f.isFavorite).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fiches.filter(f => f.isFavorite).map((fiche) => (
                  <Card 
                    key={fiche.id} 
                    className={`bg-gradient-to-b from-amber-900/20 to-orange-900/10 hover:from-amber-900/30 hover:to-orange-900/20 border-amber-800/50 transition-all cursor-pointer overflow-hidden`}
                    onClick={() => {
                      setSelectedFiche(fiche);
                      localStorage.setItem(`cyberfiche_${fiche.id}_lastViewed`, new Date().toISOString());
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-amber-800/70 rounded-md">
                          {fiche.icon}
                        </div>
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      </div>
                      
                      <h3 className="font-bold mt-3 text-lg">{fiche.title}</h3>
                      <p className="text-sm text-amber-200 mt-1">{fiche.description}</p>
                      
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-amber-700">
                          {fiche.category}
                        </Badge>
                        <Badge variant="outline" className="border-amber-600 text-amber-200">
                          {fiche.level}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-amber-900/10 rounded-lg border border-amber-900/50">
                <Star className="h-10 w-10 mx-auto text-amber-400 mb-3" />
                <h3 className="text-xl font-semibold">Aucune fiche favorite</h3>
                <p className="text-amber-300 mt-1">Ajoutez des fiches à vos favoris pour les retrouver facilement</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recents" className="space-y-6">
            {/* Cette section afficherait les fiches consultées récemment en se basant sur les timestamps stockés dans le localStorage */}
            <div className="text-center py-10 bg-amber-900/10 rounded-lg border border-amber-900/50">
              <Clock className="h-10 w-10 mx-auto text-amber-400 mb-3" />
              <h3 className="text-xl font-semibold">Historique de consultation</h3>
              <p className="text-amber-300 mt-1">Les fiches que vous consultez apparaîtront ici</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}