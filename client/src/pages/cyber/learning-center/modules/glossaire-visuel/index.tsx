import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Copy, 
  Check,
  Filter,
  X,
  Star,
  RefreshCw,
  BrainCircuit,
  Shield,
  Database,
  Lock,
  Network,
  Layers,
  File,
  Cloud,
  Globe,
  Key,
  AlertTriangle,
  Server,
  Cpu,
  Code,
  Sparkles,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  definition: string;
  extendedDefinition?: string;
  category: string;
  tags: string[];
  relatedTerms: string[];
  icon: React.ReactNode;
  isFavorite: boolean;
  isBookmarked: boolean;
  examples?: string[];
  image?: string;
}

interface GlossaryCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function GlossaireVisuel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [alphabetFilter, setAlphabetFilter] = useState<string | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  
  // États supplémentaires pour les fonctionnalités de l'IA
  const [isLoading, setIsLoading] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [comparison, setComparison] = useState<string>('');
  const [quizData, setQuizData] = useState<any>(null);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  
  // Catégories du glossaire
  const glossaryCategories: GlossaryCategory[] = [
    {
      id: 'all',
      name: 'Toutes les catégories',
      description: 'Tous les termes du glossaire',
      icon: <BookOpen />,
      color: 'blue'
    },
    {
      id: 'fundamental',
      name: 'Concepts fondamentaux',
      description: 'Principes et concepts de base en cybersécurité',
      icon: <Shield />,
      color: 'green'
    },
    {
      id: 'threats',
      name: 'Menaces et attaques',
      description: 'Types d\'attaques et vecteurs de menaces',
      icon: <AlertTriangle />,
      color: 'red'
    },
    {
      id: 'tech',
      name: 'Technologies de sécurité',
      description: 'Outils, systèmes et protocoles de sécurité',
      icon: <Lock />,
      color: 'purple'
    },
    {
      id: 'data',
      name: 'Protection des données',
      description: 'Cryptographie et sécurité des données',
      icon: <Database />,
      color: 'orange'
    },
    {
      id: 'network',
      name: 'Sécurité réseau',
      description: 'Concepts de sécurité des réseaux',
      icon: <Network />,
      color: 'cyan'
    },
    {
      id: 'compliance',
      name: 'Normes et conformité',
      description: 'Réglementations, standards et frameworks',
      icon: <File />,
      color: 'yellow'
    }
  ];
  
  // Données de démo pour les termes du glossaire
  const demoGlossaryTerms: GlossaryTerm[] = [
    {
      id: 'cia-triad',
      term: 'Triade CIA',
      acronym: 'CIA',
      definition: 'Confidentialité, Intégrité et Disponibilité - les trois principes fondamentaux de la sécurité de l\'information.',
      extendedDefinition: 'La triade CIA représente les trois principes fondamentaux de la sécurité de l\'information qui guident les politiques et mesures de sécurité dans les organisations. La Confidentialité garantit que l\'information n\'est accessible qu\'aux personnes autorisées. L\'Intégrité assure que les données restent exactes et fiables, sans modification non autorisée. La Disponibilité veille à ce que l\'information soit accessible aux utilisateurs autorisés lorsqu\'ils en ont besoin.',
      category: 'fundamental',
      tags: ['principes', 'fondamentaux', 'confidentialité', 'intégrité', 'disponibilité'],
      relatedTerms: ['access-control', 'data-breach', 'authentication'],
      icon: <Shield />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Confidentialité: Chiffrement des données sensibles, contrôles d\'accès stricts',
        'Intégrité: Hachage cryptographique, signatures numériques, contrôle de version',
        'Disponibilité: Redondance, sauvegarde, reprise après sinistre, équilibrage de charge'
      ]
    },
    {
      id: 'ransomware',
      term: 'Rançongiciel',
      acronym: 'Ransomware',
      definition: 'Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour les déchiffrer.',
      extendedDefinition: 'Un rançongiciel (ransomware) est un type de logiciel malveillant conçu pour bloquer l\'accès aux données d\'un système jusqu\'à ce qu\'une somme d\'argent soit payée. Les ransomwares modernes chiffrent les données avec des algorithmes robustes, puis demandent une rançon, généralement en cryptomonnaie, en échange de la clé de déchiffrement. Les attaques par ransomware se sont sophistiquées avec des techniques comme la double extorsion, où les attaquants menacent également de publier les données volées si la rançon n\'est pas payée.',
      category: 'threats',
      tags: ['malware', 'chiffrement', 'extorsion', 'attaque'],
      relatedTerms: ['malware', 'phishing', 'social-engineering', 'backup'],
      icon: <AlertTriangle />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'WannaCry (2017): Attaque mondiale qui a touché plus de 200 000 ordinateurs dans 150 pays',
        'NotPetya (2017): Considéré initialement comme un ransomware, mais conçu pour causer des dommages plutôt que pour obtenir des rançons',
        'REvil/Sodinokibi: Groupe de ransomware-as-a-service responsable de nombreuses attaques de grande envergure'
      ]
    },
    {
      id: 'zero-trust',
      term: 'Confiance Zéro',
      acronym: 'Zero Trust',
      definition: 'Modèle de sécurité basé sur le principe "ne jamais faire confiance, toujours vérifier" qui requiert une vérification stricte de chaque utilisateur et appareil.',
      extendedDefinition: 'Le modèle Zero Trust est une approche de la sécurité informatique qui part du principe qu\'aucune entité, qu\'elle soit à l\'intérieur ou à l\'extérieur du réseau organisationnel, ne doit être considérée comme fiable par défaut. Ce modèle exige que chaque utilisateur, appareil, application et flux de données soit vérifié et validé en permanence. Contrairement au modèle traditionnel qui faisait confiance aux entités à l\'intérieur du réseau, Zero Trust suppose une brèche potentielle et vérifie continuellement les identités et privilèges, applique des contrôles d\'accès stricts, et surveille les comportements pour détecter les anomalies.',
      category: 'tech',
      tags: ['architecture', 'authentification', 'vérification', 'confiance'],
      relatedTerms: ['mfa', 'least-privilege', 'microsegmentation', 'sase'],
      icon: <Lock />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Vérification continue de l\'identité via l\'authentification multifacteur',
        'Segmentation du réseau pour limiter la mobilité latérale',
        'Accès conditionnel basé sur l\'identité, l\'appareil et le contexte'
      ]
    },
    {
      id: 'mfa',
      term: 'Authentification multifacteur',
      acronym: 'MFA',
      definition: 'Méthode d\'authentification nécessitant deux ou plusieurs facteurs de vérification indépendants pour accéder à un système.',
      extendedDefinition: 'L\'authentification multifacteur (MFA) est une méthode de sécurité qui exige que l\'utilisateur fournisse au moins deux facteurs d\'authentification différents pour vérifier son identité. Ces facteurs appartiennent généralement à trois catégories: quelque chose que l\'utilisateur connaît (mot de passe, code PIN), quelque chose que l\'utilisateur possède (téléphone, token physique), et quelque chose que l\'utilisateur est (données biométriques comme empreinte digitale ou reconnaissance faciale). En exigeant plusieurs facteurs, le MFA rend beaucoup plus difficile pour un attaquant de compromettre un compte, même si l\'un des facteurs est compromis.',
      category: 'tech',
      tags: ['authentification', 'identité', 'vérification', 'facteurs'],
      relatedTerms: ['2fa', 'totp', 'biometrics', 'authentication'],
      icon: <Key />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Mot de passe (connaissance) + code SMS (possession)',
        'Code PIN (connaissance) + empreinte digitale (inhérence)',
        'Mot de passe (connaissance) + application d\'authentification (possession)'
      ]
    },
    {
      id: 'apt',
      term: 'Menace persistante avancée',
      acronym: 'APT',
      definition: 'Attaque complexe et ciblée où un attaquant établit une présence non détectée et prolongée dans un réseau.',
      extendedDefinition: 'Une menace persistante avancée (Advanced Persistent Threat) désigne un type d\'attaque sophistiquée et de longue durée, généralement menée par des acteurs bien financés et hautement organisés, comme des États-nations ou des groupes sponsorisés par des États. Les APT se caractérisent par leur persistance (maintien d\'un accès sur une longue période), leur discrétion (évitement des détections), et leur objectif spécifique (généralement l\'espionnage industriel ou gouvernemental). Ces attaques impliquent souvent des techniques avancées d\'intrusion, des malwares personnalisés, et l\'exploitation de vulnérabilités zero-day.',
      category: 'threats',
      tags: ['espionnage', 'ciblé', 'persistent', 'sophistiqué'],
      relatedTerms: ['zero-day', 'lateral-movement', 'exfiltration', 'nation-state'],
      icon: <AlertTriangle />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'APT29 (Cozy Bear): Groupe associé au renseignement russe, connu pour son implication dans des opérations d\'espionnage politique',
        'APT41: Groupe lié à la Chine, mêlant espionnage soutenu par l\'État et cybercriminalité financière',
        'Stuxnet: Malware sophistiqué conçu pour cibler et saboter le programme nucléaire iranien'
      ]
    },
    {
      id: 'encryption',
      term: 'Chiffrement',
      acronym: 'Encryption',
      definition: 'Processus de conversion d\'informations en un code pour empêcher l\'accès non autorisé aux données.',
      extendedDefinition: 'Le chiffrement est un processus qui convertit des données lisibles (texte en clair) en format codé et inintelligible (texte chiffré) à l\'aide d\'algorithmes mathématiques et de clés. Cette transformation protège la confidentialité des informations, car seules les parties possédant la clé appropriée peuvent déchiffrer et accéder aux données originales. Il existe deux principaux types de chiffrement: symétrique (même clé pour chiffrer et déchiffrer) et asymétrique (paire de clés publique/privée). Le chiffrement est fondamental pour sécuriser les communications, protéger les données sensibles et assurer la confidentialité des informations numériques.',
      category: 'data',
      tags: ['confidentialité', 'cryptographie', 'protection', 'données'],
      relatedTerms: ['symmetric-encryption', 'asymmetric-encryption', 'aes', 'rsa', 'pki'],
      icon: <Lock />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Chiffrement symétrique: AES-256 utilisé pour chiffrer les disques durs',
        'Chiffrement asymétrique: RSA utilisé pour l\'échange sécurisé de clés',
        'Chiffrement de bout en bout: WhatsApp, Signal pour les messages'
      ]
    },
    {
      id: 'dlp',
      term: 'Prévention de perte de données',
      acronym: 'DLP',
      definition: 'Technologies et processus visant à détecter et prévenir la divulgation non autorisée de données sensibles.',
      extendedDefinition: 'La prévention de perte de données (Data Loss Prevention) englobe les stratégies, technologies et processus conçus pour identifier, surveiller et protéger les données sensibles contre les fuites, vols ou accès non autorisés. Les solutions DLP analysent les activités des données dans trois états: au repos (stockées), en mouvement (en transit sur le réseau) et en utilisation (sur les endpoints). Elles appliquent des politiques basées sur le contenu, le contexte et l\'utilisateur pour prévenir les violations de données, qu\'elles soient accidentelles ou malveillantes. Le DLP aide également les organisations à maintenir la conformité réglementaire en contrôlant strictement la manipulation des données sensibles.',
      category: 'data',
      tags: ['protection', 'données', 'conformité', 'fuites'],
      relatedTerms: ['classification', 'exfiltration', 'monitoring', 'content-inspection'],
      icon: <Database />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Analyse du contenu des emails pour bloquer l\'envoi de données personnelles identifiables',
        'Surveillance du transfert de fichiers vers des supports amovibles',
        'Contrôle des informations copiées dans le presse-papiers ou imprimées'
      ]
    },
    {
      id: 'siem',
      term: 'Gestion des informations et événements de sécurité',
      acronym: 'SIEM',
      definition: 'Système qui collecte, analyse et corrèle les données de journaux pour détecter et répondre aux incidents de sécurité.',
      extendedDefinition: 'Un SIEM (Security Information and Event Management) est une solution de sécurité qui combine la gestion des informations de sécurité (SIM) et la gestion des événements de sécurité (SEM). Ces systèmes collectent, agrègent et analysent les données de journaux provenant de multiples sources dans l\'infrastructure informatique, puis corrèlent ces informations pour identifier des modèles d\'activité anormaux et des incidents de sécurité potentiels. Les SIEM modernes intègrent souvent des capacités d\'analyse comportementale, d\'intelligence artificielle et de réponse automatisée pour améliorer la détection des menaces avancées et accélérer la réponse aux incidents.',
      category: 'tech',
      tags: ['journalisation', 'analyse', 'corrélation', 'détection'],
      relatedTerms: ['soar', 'log-management', 'security-analytics', 'incident-response'],
      icon: <Layers />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Corrélation d\'événements de journaux provenant de pare-feu, IDS et serveurs',
        'Analyse comportementale pour détecter les activités d\'utilisateurs anormales',
        'Création d\'alertes en temps réel pour les tentatives d\'accès suspectes'
      ]
    },
    {
      id: 'xss',
      term: 'Cross-Site Scripting',
      acronym: 'XSS',
      definition: 'Vulnérabilité web permettant à un attaquant d\'injecter des scripts malveillants qui s\'exécutent dans le navigateur de la victime.',
      extendedDefinition: 'Le Cross-Site Scripting (XSS) est une vulnérabilité de sécurité web qui permet à un attaquant d\'injecter des scripts côté client (généralement JavaScript) qui s\'exécutent dans le navigateur de l\'utilisateur final. Il existe trois principaux types de XSS: réfléchi (où le code malveillant est renvoyé dans la réponse immédiate du serveur), stocké (où le code malveillant est sauvegardé sur le serveur et affiché à plusieurs utilisateurs), et basé sur le DOM (où la vulnérabilité existe dans le code JavaScript côté client). Les attaques XSS peuvent permettre le vol de cookies de session, la redirection vers des sites malveillants, la modification de contenu de page, et d\'autres actions malveillantes dans le contexte du site vulnérable.',
      category: 'threats',
      tags: ['vulnérabilité', 'web', 'injection', 'script'],
      relatedTerms: ['csrf', 'content-security-policy', 'input-validation', 'output-encoding'],
      icon: <Code />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'XSS réfléchi: Injection de script via un paramètre d\'URL',
        'XSS stocké: Injection de code malveillant dans un commentaire de forum',
        'XSS basé sur le DOM: Manipulation du DOM via JavaScript client'
      ]
    },
    {
      id: 'ips-ids',
      term: 'Système de détection/prévention d\'intrusion',
      acronym: 'IDS/IPS',
      definition: 'Technologies de sécurité réseau qui surveillent et/ou bloquent les activités malveillantes et les violations de politique.',
      extendedDefinition: 'Les systèmes de détection d\'intrusion (IDS) surveillent le trafic réseau ou les activités système pour détecter les tentatives d\'intrusion ou les violations de politique de sécurité, puis génèrent des alertes. Les systèmes de prévention d\'intrusion (IPS) vont plus loin en bloquant activement les menaces détectées. Ces systèmes peuvent être basés sur le réseau (surveillance du trafic réseau) ou sur l\'hôte (surveillance des activités système). Ils utilisent diverses méthodes de détection, notamment la reconnaissance de signatures (correspondance avec des modèles d\'attaques connues), l\'analyse de comportement (identification d\'activités anormales) et la détection d\'anomalies (écarts par rapport aux comportements normaux établis).',
      category: 'network',
      tags: ['détection', 'prévention', 'surveillance', 'réseau'],
      relatedTerms: ['nids', 'hids', 'signature-detection', 'anomaly-detection', 'network-security'],
      icon: <Network />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'NIDS (Network-based IDS): Surveillance du trafic au niveau d\'un point stratégique du réseau',
        'HIDS (Host-based IDS): Analyse des journaux système et des modifications de fichiers',
        'IPS: Blocage automatique des paquets suspects basé sur des règles prédéfinies'
      ]
    },
    {
      id: 'iso27001',
      term: 'ISO/IEC 27001',
      acronym: 'ISO 27001',
      definition: 'Norme internationale pour les systèmes de gestion de la sécurité de l\'information (SMSI).',
      extendedDefinition: 'ISO/IEC 27001 est une norme internationale qui spécifie les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un système de gestion de la sécurité de l\'information (SMSI). Cette norme adopte une approche basée sur les risques pour la sécurité de l\'information, exigeant des organisations qu\'elles identifient systématiquement les menaces, évaluent les vulnérabilités et mettent en œuvre des contrôles appropriés. La certification ISO 27001 démontre qu\'une organisation a mis en place un cadre robuste pour protéger les informations sensibles, gérer les risques de sécurité et se conformer aux exigences réglementaires. La norme est complétée par ISO/IEC 27002, qui fournit des lignes directrices pour les contrôles de sécurité organisationnels.',
      category: 'compliance',
      tags: ['norme', 'SMSI', 'certification', 'conformité'],
      relatedTerms: ['iso27002', 'risk-management', 'compliance', 'security-controls'],
      icon: <File />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Mise en place d\'un inventaire des actifs informationnels',
        'Développement d\'une politique de sécurité de l\'information',
        'Implémentation d\'un processus de gestion des risques'
      ]
    },
    {
      id: 'penetration-testing',
      term: 'Test d\'intrusion',
      acronym: 'Pentest',
      definition: 'Méthode d\'évaluation de la sécurité consistant à simuler des attaques contre un système pour identifier et corriger les vulnérabilités.',
      extendedDefinition: 'Le test d\'intrusion (ou penetration testing) est une pratique de cybersécurité qui consiste à évaluer la sécurité d\'un système informatique, réseau ou application en simulant des attaques réelles de manière contrôlée. Contrairement à un simple scan de vulnérabilités, un test d\'intrusion implique l\'exploitation active des failles de sécurité pour démontrer l\'impact potentiel d\'une attaque. Les pentests suivent généralement une méthodologie structurée comprenant la reconnaissance, l\'analyse des vulnérabilités, l\'exploitation, l\'élévation de privilèges, le maintien de l\'accès et l\'effacement des traces. Les résultats du test fournissent une évaluation pratique des défenses de sécurité et orientent les efforts de remédiation.',
      category: 'tech',
      tags: ['évaluation', 'simulation', 'vulnérabilités', 'exploitation'],
      relatedTerms: ['vulnerability-assessment', 'red-team', 'ethical-hacking', 'bug-bounty'],
      icon: <Shield />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Test d\'intrusion black-box: sans connaissance préalable du système',
        'Test d\'intrusion white-box: avec accès complet aux informations du système',
        'Test d\'intrusion grey-box: avec connaissance partielle du système'
      ]
    },
    {
      id: 'dnssec',
      term: 'Extensions de sécurité du DNS',
      acronym: 'DNSSEC',
      definition: 'Ensemble de spécifications pour sécuriser le DNS en vérifiant l\'authenticité et l\'intégrité des réponses DNS.',
      extendedDefinition: 'DNSSEC (Domain Name System Security Extensions) est un ensemble de protocoles conçus pour renforcer la sécurité du système de noms de domaine (DNS) en ajoutant une couche d\'authentification et d\'intégrité aux réponses DNS. Il protège contre plusieurs attaques, notamment l\'empoisonnement de cache DNS (où un attaquant redirige les utilisateurs vers des sites malveillants en corrompant les données DNS). DNSSEC utilise la cryptographie à clé publique pour permettre aux serveurs DNS de signer cryptographiquement les enregistrements, créant ainsi une chaîne de confiance de la racine DNS jusqu\'au domaine de destination. Lorsqu\'il est correctement déployé, DNSSEC garantit que les utilisateurs se connectent aux sites web légitimes qu\'ils cherchent à atteindre.',
      category: 'network',
      tags: ['DNS', 'authentification', 'intégrité', 'infrastructure'],
      relatedTerms: ['dns', 'dns-cache-poisoning', 'pki', 'digital-signatures'],
      icon: <Globe />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Signatures numériques des enregistrements DNS',
        'Chaîne de confiance depuis la racine DNS',
        'Protection contre l\'empoisonnement du cache DNS'
      ]
    },
    {
      id: 'soc',
      term: 'Centre opérationnel de sécurité',
      acronym: 'SOC',
      definition: 'Équipe centralisée qui surveille, analyse et répond aux incidents de cybersécurité au sein d\'une organisation.',
      extendedDefinition: 'Un Centre Opérationnel de Sécurité (Security Operations Center) est une installation centralisée où une équipe de professionnels de la sécurité surveille, détecte, analyse et répond aux incidents de cybersécurité 24h/24 et 7j/7. Le SOC agit comme le centre nerveux des opérations de sécurité d\'une organisation, utilisant diverses technologies (SIEM, EDR, NDR) et processus pour identifier les menaces potentielles, mener des investigations et coordonner les réponses aux incidents. Un SOC efficace intègre des renseignements sur les menaces, l\'analyse comportementale et l\'automatisation pour détecter les attaques sophistiquées avant qu\'elles ne causent des dommages significatifs. Les SOC peuvent être internes à l\'organisation, externalisés auprès de fournisseurs spécialisés (MSSP), ou hybrides.',
      category: 'tech',
      tags: ['surveillance', 'réponse', 'opérations', 'équipe'],
      relatedTerms: ['incident-response', 'csirt', 'mssp', 'security-monitoring'],
      icon: <Shield />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Surveillance continue des alertes de sécurité via un SIEM',
        'Triage et investigation des incidents potentiels',
        'Coordination de la réponse aux incidents confirmés'
      ]
    },
    {
      id: 'zero-day',
      term: 'Vulnérabilité Zero-Day',
      acronym: 'Zero-day',
      definition: 'Faille de sécurité exploitée par des attaquants avant qu\'elle ne soit connue du vendeur ou qu\'un correctif soit disponible.',
      extendedDefinition: 'Une vulnérabilité zero-day (ou jour zéro) est une faille de sécurité dans un logiciel qui est inconnue des parties intéressées à la corriger (y compris le fournisseur du logiciel). Le terme "zero-day" fait référence au fait que les développeurs ont "zéro jour" pour résoudre le problème avant qu\'il ne soit exploité. Ces vulnérabilités sont particulièrement dangereuses car elles peuvent être exploitées avant qu\'un correctif ne soit disponible, laissant les utilisateurs sans défense contre les attaques. Les exploits zero-day sont souvent vendus sur le marché noir à des prix élevés ou utilisés par des acteurs étatiques pour des opérations de cyber-espionnage ciblées. La découverte et la correction rapides de ces vulnérabilités sont essentielles pour minimiser leur impact.',
      category: 'threats',
      tags: ['vulnérabilité', 'exploit', 'non-corrigée', 'attaque'],
      relatedTerms: ['vulnerability', 'exploit', 'patch-management', 'disclosure'],
      icon: <AlertTriangle />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Stuxnet: Exploitait plusieurs vulnérabilités zero-day dans Windows pour cibler les systèmes SCADA iraniens',
        'EternalBlue: Vulnérabilité dans SMB de Windows exploitée par WannaCry avant que le correctif ne soit largement déployé',
        'Zero-day dans les navigateurs qui permettent l\'exécution de code à distance via des sites web malveillants'
      ]
    },
    {
      id: 'owasp-top-10',
      term: 'OWASP Top 10',
      acronym: 'OWASP Top 10',
      definition: 'Liste des dix risques de sécurité les plus critiques pour les applications web, publiée par l\'Open Web Application Security Project.',
      extendedDefinition: 'L\'OWASP Top 10 est un document de sensibilisation standard publié par l\'Open Web Application Security Project, une organisation à but non lucratif dédiée à l\'amélioration de la sécurité des logiciels. Cette liste identifie et classe les dix risques de sécurité les plus critiques pour les applications web, basés sur la fréquence des vulnérabilités, leur facilité d\'exploitation, et leur impact potentiel. Mise à jour périodiquement (dernières versions en 2017 et 2021), l\'OWASP Top 10 sert de référence pour les développeurs, testeurs, et organisations pour prioriser leurs efforts de sécurité. Elle couvre des vulnérabilités comme l\'injection SQL, la mauvaise authentification, l\'exposition de données sensibles, et les failles XSS, tout en fournissant des conseils sur la manière de les atténuer.',
      category: 'compliance',
      tags: ['web', 'vulnérabilités', 'standards', 'développement'],
      relatedTerms: ['application-security', 'web-security', 'secure-coding', 'vulnerability'],
      icon: <Code />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'A01:2021 – Broken Access Control: Contrôles d\'accès inappropriés permettant un accès non autorisé',
        'A03:2021 – Injection: Failles permettant l\'injection de code SQL, NoSQL, OS, LDAP',
        'A07:2021 – Identification and Authentication Failures: Faiblesses dans les mécanismes d\'authentification'
      ]
    },
    {
      id: 'cloud-security',
      term: 'Sécurité du cloud',
      acronym: 'Cloud Security',
      definition: 'Ensemble de politiques, contrôles, procédures et technologies qui protègent les données, applications et infrastructures cloud.',
      extendedDefinition: 'La sécurité du cloud comprend les politiques, technologies, contrôles et services conçus pour protéger les données, applications et infrastructures cloud contre les menaces. Elle adapte les principes traditionnels de cybersécurité au modèle cloud, tout en abordant les défis spécifiques liés à l\'architecture distribuée, aux responsabilités partagées et à l\'accessibilité globale des services cloud. Les stratégies de sécurité cloud doivent tenir compte des différents modèles de service (IaaS, PaaS, SaaS) et de déploiement (public, privé, hybride). Les principaux aspects incluent la gestion des identités et des accès, la protection des données, la sécurité des applications, la conformité réglementaire, la souveraineté des données, et la capacité à répondre aux incidents dans des environnements virtualisés et multi-locataires.',
      category: 'tech',
      tags: ['cloud', 'saas', 'iaas', 'paas'],
      relatedTerms: ['casb', 'cspm', 'shared-responsibility', 'multi-tenancy'],
      icon: <Cloud />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'IAM (Identity and Access Management) pour contrôler précisément l\'accès aux ressources cloud',
        'CASB (Cloud Access Security Broker) pour appliquer les politiques de sécurité',
        'Chiffrement des données au repos et en transit dans les environnements cloud'
      ]
    },
    {
      id: 'sdlc',
      term: 'Cycle de développement sécurisé des logiciels',
      acronym: 'SDLC',
      definition: 'Processus qui intègre la sécurité à chaque phase du cycle de développement logiciel.',
      extendedDefinition: 'Le Cycle de Développement Sécurisé des Logiciels (Secure Software Development Lifecycle) est une approche méthodologique qui intègre la sécurité à chaque étape du processus de développement, de la planification initiale à la livraison et la maintenance. Contrairement aux pratiques traditionnelles où la sécurité est souvent considérée comme une réflexion après coup, le SDLC fait de la sécurité une préoccupation constante tout au long du projet. Ce processus comprend généralement la modélisation des menaces, l\'analyse des risques, les examens de conception sécurisés, le codage sécurisé, les tests de sécurité (y compris les tests statiques et dynamiques), et la validation de sécurité avant déploiement. L\'objectif est d\'identifier et de corriger les vulnérabilités tôt dans le cycle de développement, réduisant ainsi les coûts et les risques associés aux failles de sécurité.',
      category: 'tech',
      tags: ['développement', 'sécurité', 'logiciel', 'cycle de vie'],
      relatedTerms: ['threat-modeling', 'sast', 'dast', 'devsecops'],
      icon: <Code />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'Modélisation des menaces durant la phase de conception',
        'Analyse de code statique (SAST) intégrée dans le pipeline CI/CD',
        'Tests de sécurité dynamiques (DAST) avant le déploiement'
      ]
    },
    {
      id: 'quantum-cryptography',
      term: 'Cryptographie quantique',
      acronym: 'QC',
      definition: 'Utilisation des principes de la mécanique quantique pour sécuriser les communications de manière théoriquement inviolable.',
      extendedDefinition: 'La cryptographie quantique utilise les principes de la mécanique quantique pour développer des systèmes cryptographiques que même les ordinateurs quantiques ne pourraient pas compromettre. La plus connue de ces techniques est la distribution quantique de clés (QKD), qui permet à deux parties d\'établir une clé secrète partagée dont la sécurité repose sur les principes fondamentaux de la physique quantique, notamment le théorème de non-clonage et le principe d\'incertitude d\'Heisenberg. Contrairement à la cryptographie traditionnelle basée sur la complexité mathématique, la cryptographie quantique peut détecter toute tentative d\'interception, car toute mesure d\'un système quantique le perturbe de manière détectable. Alors que les ordinateurs quantiques menacent de nombreux systèmes cryptographiques actuels, la cryptographie post-quantique développe également des algorithmes classiques résistants aux attaques quantiques.',
      category: 'data',
      tags: ['quantique', 'cryptographie', 'avancé', 'futur'],
      relatedTerms: ['qkd', 'post-quantum-cryptography', 'quantum-computing', 'cryptography'],
      icon: <Cpu />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'QKD (Quantum Key Distribution): Distribution de clés basée sur les propriétés quantiques',
        'BB84: Premier protocole de distribution quantique de clés',
        'E91: Protocole QKD basé sur l\'intrication quantique'
      ]
    },
    {
      id: 'supply-chain-attack',
      term: 'Attaque par chaîne d\'approvisionnement',
      acronym: 'Supply Chain Attack',
      definition: 'Méthode d\'attaque ciblant des fournisseurs, des processus ou des produits tiers pour compromettre l\'objectif final.',
      extendedDefinition: 'Une attaque par chaîne d\'approvisionnement cible les maillons faibles dans la chaîne d\'approvisionnement logicielle ou matérielle d\'une organisation pour compromettre une cible. Au lieu d\'attaquer directement l\'organisation, l\'attaquant compromet un fournisseur, un prestataire ou un produit tiers auquel la cible fait confiance. Ces attaques peuvent prendre plusieurs formes: insertion de code malveillant dans des logiciels légitimes, compromission des processus de développement, altération des mises à jour de logiciels, ou même modification de composants matériels. L\'efficacité de ces attaques réside dans l\'exploitation de la confiance établie entre une organisation et ses fournisseurs, permettant aux attaquants de contourner de nombreuses défenses traditionnelles. L\'attaque SolarWinds de 2020 est un exemple notable, où des acteurs malveillants ont compromis le processus de mise à jour d\'un logiciel de gestion d\'infrastructure utilisé par des milliers d\'organisations et d\'agences gouvernementales.',
      category: 'threats',
      tags: ['tiers', 'fournisseur', 'confiance', 'compromission'],
      relatedTerms: ['third-party-risk', 'trusted-relationship', 'software-tampering', 'vendor-security'],
      icon: <Network />,
      isFavorite: false,
      isBookmarked: false,
      examples: [
        'SolarWinds (2020): Compromission du logiciel Orion affectant des milliers d\'organisations',
        'NotPetya (2017): Propagation via le logiciel de comptabilité M.E.Doc en Ukraine',
        'Compromission de CCleaner (2017): Distribution de malware via une application de nettoyage légitime'
      ]
    }
  ];
  
  // Initialisation des termes du glossaire
  useEffect(() => {
    // Simuler le chargement des termes depuis une API
    setGlossaryTerms(demoGlossaryTerms);
    
    // Charger les favoris et signets depuis le localStorage
    const storedFavorites = JSON.parse(localStorage.getItem('glossaryFavorites') || '[]');
    const storedBookmarks = JSON.parse(localStorage.getItem('glossaryBookmarks') || '[]');
    
    if (storedFavorites.length > 0 || storedBookmarks.length > 0) {
      const updatedTerms = demoGlossaryTerms.map(term => ({
        ...term,
        isFavorite: storedFavorites.includes(term.id),
        isBookmarked: storedBookmarks.includes(term.id)
      }));
      
      setGlossaryTerms(updatedTerms);
    }
    
    // Filtrer initialement les termes
    filterTerms('all', false, false, '');
  }, []);
  
  // On a déjà un effet d'initialisation au-dessus, pas besoin d'un second
  
  // Effet pour mettre à jour les filtres quand les critères changent
  useEffect(() => {
    filterTerms(selectedCategory, showFavoritesOnly, showBookmarksOnly, searchTerm);
  }, [selectedCategory, showFavoritesOnly, showBookmarksOnly, searchTerm, alphabetFilter, glossaryTerms]);
  
  // Fonction pour rechercher un terme dans le glossaire via l'API
  const searchGlossaryTerm = async (term: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/cyber/glossary/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche du terme');
      }

      const data = await response.json();
      
      if (data.success && data.term) {
        // Ajouter l'icône appropriée selon la catégorie
        const termWithIcon = {
          ...data.term,
          icon: getCategoryIcon(data.term.category)
        };
        
        // Ajouter le nouveau terme au glossaire s'il n'existe pas déjà
        setGlossaryTerms(prevTerms => {
          const exists = prevTerms.some(t => t.id === termWithIcon.id);
          if (!exists) {
            return [...prevTerms, termWithIcon];
          }
          return prevTerms;
        });
        
        // Sélectionner le terme pour l'afficher
        setSelectedTerm(termWithIcon);
        
        // Mettre à jour les termes filtrés
        filterTerms(selectedCategory, showFavoritesOnly, showBookmarksOnly, searchTerm);
        
        toast({
          title: "Terme trouvé",
          description: `Le terme "${term}" a été trouvé et ajouté au glossaire.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Terme non trouvé",
          description: "Impossible de trouver des informations sur ce terme.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche du terme.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir une explication personnalisée d'un concept
  const explainConceptDetail = async (concept: string, context?: string) => {
    try {
      setIsExplaining(true);

      const response = await fetch('/api/cyber/glossary/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept, context }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'explication du concept');
      }

      const data = await response.json();
      
      if (data.success && data.explanation) {
        setExplanation(data.explanation);
        setShowExplanationDialog(true);
      } else {
        toast({
          title: "Explication non disponible",
          description: "Impossible d'obtenir une explication pour ce concept.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'explication:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'explication du concept.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  // Fonction pour comparer deux termes
  const compareTermsDetail = async (term1: string, term2: string) => {
    try {
      setIsComparing(true);

      const response = await fetch('/api/cyber/glossary/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term1, term2 }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la comparaison des termes');
      }

      const data = await response.json();
      
      if (data.success && data.comparison) {
        setComparison(data.comparison);
        setShowComparisonDialog(true);
      } else {
        toast({
          title: "Comparaison non disponible",
          description: "Impossible d'obtenir une comparaison pour ces termes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la comparaison des termes.",
        variant: "destructive",
      });
    } finally {
      setIsComparing(false);
    }
  };

  // Fonction pour générer un quiz sur un terme ou concept
  const generateQuizOnTerm = async (term?: string, difficulty: string = 'moyen') => {
    try {
      setIsGeneratingQuiz(true);

      const response = await fetch('/api/cyber/glossary/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ term, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du quiz');
      }

      const data = await response.json();
      
      if (data.success && data.quiz) {
        setQuizData(data.quiz);
        setShowQuizDialog(true);
      } else {
        toast({
          title: "Quiz non disponible",
          description: "Impossible de générer un quiz pour ce terme.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du quiz:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du quiz.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Fonction pour obtenir l'icône correspondant à une catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'threats': return <AlertTriangle />;
      case 'defense': return <Shield />;
      case 'tools': return <Wrench />;
      case 'data': return <Database />;
      case 'network': return <Network />;
      case 'compliance': return <File />;
      case 'fundamental': return <BookOpen />;
      case 'tech': return <Lock />;
      default: return <Shield />;
    }
  };

  // Fonction pour filtrer les termes
  const filterTerms = (category: string, favoritesOnly: boolean, bookmarksOnly: boolean, search: string) => {
    let filtered = glossaryTerms;
    
    // Filtrer par catégorie
    if (category !== 'all') {
      filtered = filtered.filter(term => term.category === category);
    }
    
    // Filtrer par favoris
    if (favoritesOnly) {
      filtered = filtered.filter(term => term.isFavorite);
    }
    
    // Filtrer par signets
    if (bookmarksOnly) {
      filtered = filtered.filter(term => term.isBookmarked);
    }
    
    // Filtrer par recherche
    if (search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(term => 
        term.term.toLowerCase().includes(searchLower) || 
        (term.acronym && term.acronym.toLowerCase().includes(searchLower)) ||
        term.definition.toLowerCase().includes(searchLower) ||
        term.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtrer par lettre (alphabet)
    if (alphabetFilter) {
      filtered = filtered.filter(term => term.term.charAt(0).toLowerCase() === alphabetFilter.toLowerCase());
    }
    
    // Trier par ordre alphabétique
    filtered = filtered.sort((a, b) => a.term.localeCompare(b.term));
    
    setFilteredTerms(filtered);
  };
  
  // Fonction pour copier la définition
  const copyDefinition = (id: string, definition: string) => {
    navigator.clipboard.writeText(definition);
    setCopiedTerm(id);
    
    setTimeout(() => {
      setCopiedTerm(null);
    }, 2000);
    
    toast({
      title: "Définition copiée",
      description: "La définition a été copiée dans le presse-papiers",
      variant: "default",
    });
  };
  
  // Fonction pour ajouter/retirer des favoris
  const toggleFavorite = (id: string) => {
    const updatedTerms = glossaryTerms.map(term => 
      term.id === id ? {...term, isFavorite: !term.isFavorite} : term
    );
    
    setGlossaryTerms(updatedTerms);
    
    const favorites = updatedTerms.filter(term => term.isFavorite).map(term => term.id);
    localStorage.setItem('glossaryFavorites', JSON.stringify(favorites));
    
    // Si le terme actuellement sélectionné est modifié, mettre à jour également
    if (selectedTerm && selectedTerm.id === id) {
      setSelectedTerm({
        ...selectedTerm,
        isFavorite: !selectedTerm.isFavorite
      });
    }
    
    toast({
      title: updatedTerms.find(t => t.id === id)?.isFavorite 
        ? "Terme ajouté aux favoris" 
        : "Terme retiré des favoris",
      variant: "default",
    });
    
    // Mettre à jour le filtrage
    filterTerms(selectedCategory, showFavoritesOnly, showBookmarksOnly, searchTerm);
  };
  
  // Fonction pour ajouter/retirer des signets
  const toggleBookmark = (id: string) => {
    const updatedTerms = glossaryTerms.map(term => 
      term.id === id ? {...term, isBookmarked: !term.isBookmarked} : term
    );
    
    setGlossaryTerms(updatedTerms);
    
    const bookmarks = updatedTerms.filter(term => term.isBookmarked).map(term => term.id);
    localStorage.setItem('glossaryBookmarks', JSON.stringify(bookmarks));
    
    // Si le terme actuellement sélectionné est modifié, mettre à jour également
    if (selectedTerm && selectedTerm.id === id) {
      setSelectedTerm({
        ...selectedTerm,
        isBookmarked: !selectedTerm.isBookmarked
      });
    }
    
    toast({
      title: updatedTerms.find(t => t.id === id)?.isBookmarked 
        ? "Terme ajouté aux signets" 
        : "Terme retiré des signets",
      variant: "default",
    });
    
    // Mettre à jour le filtrage
    filterTerms(selectedCategory, showFavoritesOnly, showBookmarksOnly, searchTerm);
  };
  
  // Liste des lettres de l'alphabet pour le filtre
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
  
  // Interface pour les questions du quiz
  interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* Dialogue d'explication détaillée */}
      <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
        <DialogContent className="bg-slate-900 text-white border-green-700 max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-green-400 text-xl flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" />
              Explication détaillée du concept
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="p-2 whitespace-pre-wrap">
              {explanation}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button 
              onClick={() => setShowExplanationDialog(false)}
              className="bg-green-700 hover:bg-green-800"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de comparaison de termes */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="bg-slate-900 text-white border-blue-700 max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-blue-400 text-xl flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Comparaison de concepts
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="p-2 whitespace-pre-wrap">
              {comparison}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button 
              onClick={() => setShowComparisonDialog(false)}
              className="bg-blue-700 hover:bg-blue-800"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de quiz */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="bg-slate-900 text-white border-purple-700 max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-xl flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Quiz de cybersécurité
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Testez vos connaissances sur les concepts de cybersécurité
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {quizData && (
              <div className="space-y-6 p-2">
                <div className="p-4 bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{quizData.title || "Quiz de cybersécurité"}</h3>
                  <p className="text-slate-300">{quizData.description || "Testez vos connaissances"}</p>
                </div>
                
                {quizData.questions && quizData.questions.map((question: QuizQuestion, index: number) => (
                  <div key={index} className="p-4 bg-slate-800 rounded-lg">
                    <h4 className="font-medium mb-3 text-purple-300">Question {index + 1}: {question.question}</h4>
                    <RadioGroup className="space-y-2">
                      {question.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-start space-x-2">
                          <RadioGroupItem 
                            value={optIndex.toString()} 
                            id={`q${index}-opt${optIndex}`} 
                            className="border-purple-500 text-purple-500"
                          />
                          <Label htmlFor={`q${index}-opt${optIndex}`} className="text-slate-200">{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="explanation" className="border-slate-700">
                        <AccordionTrigger className="text-sm text-purple-400">
                          Voir l'explication
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300 bg-slate-800/50 p-3 rounded-md">
                          <p>{question.explanation}</p>
                          <p className="mt-2 font-medium">
                            Réponse correcte: {question.options[question.correctAnswer]}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button 
              onClick={() => setShowQuizDialog(false)}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              <BookOpen className="mr-3 h-6 w-6 text-green-400" />
              Glossaire visuel de cybersécurité
            </h1>
            <p className="text-blue-200 mt-1">Lexique illustré des termes techniques essentiels</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-purple-500 text-purple-200 hover:bg-purple-800/30"
              onClick={() => generateQuizOnTerm(undefined, 'moyen')}
              disabled={isGeneratingQuiz}
            >
              {isGeneratingQuiz ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Quiz Général
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-500 text-green-200 hover:bg-green-800/30"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres {showFilters ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <div className="bg-green-900/20 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-green-300" />
              <Input 
                placeholder="Rechercher par terme, acronyme ou mot-clé..." 
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchInputValue.trim() !== '') {
                    e.preventDefault();
                    searchGlossaryTerm(searchInputValue.trim());
                  }
                }}
                className="pl-10 bg-green-950/40 border-green-700/50 text-white placeholder:text-green-300/70"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-500 text-green-200 hover:bg-green-800/30"
              onClick={() => {
                if (searchInputValue.trim() !== '') {
                  searchGlossaryTerm(searchInputValue.trim());
                }
              }}
              disabled={isLoading || searchInputValue.trim() === ''}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher avec l'IA
                </>
              )}
            </Button>
          </div>
          
          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-green-700/30"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm text-green-200 mb-2">Domaines</h3>
                    <div className="flex flex-wrap gap-2">
                      {glossaryCategories.map((category) => (
                        <Badge
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className={`cursor-pointer ${
                            selectedCategory === category.id 
                              ? `bg-${category.color}-700 hover:bg-${category.color}-800` 
                              : `border-${category.color}-700 text-${category.color}-300 hover:bg-${category.color}-900/30`
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-green-200 mb-2">Filtres rapides</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={showFavoritesOnly ? "default" : "outline"}
                        className={`cursor-pointer ${
                          showFavoritesOnly 
                            ? 'bg-amber-700 hover:bg-amber-800' 
                            : 'border-amber-700 text-amber-300 hover:bg-amber-900/30'
                        }`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      >
                        <Star className={`mr-1 h-3 w-3 ${showFavoritesOnly ? 'fill-white' : 'fill-amber-500 text-amber-500'}`} />
                        Favoris
                      </Badge>
                      
                      <Badge
                        variant={showBookmarksOnly ? "default" : "outline"}
                        className={`cursor-pointer ${
                          showBookmarksOnly 
                            ? 'bg-blue-700 hover:bg-blue-800' 
                            : 'border-blue-700 text-blue-300 hover:bg-blue-900/30'
                        }`}
                        onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                      >
                        <BookOpen className="mr-1 h-3 w-3" />
                        Signets
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-green-200 mb-2">Filtrage alphabétique</h3>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={alphabetFilter === null ? "default" : "outline"}
                        className={`cursor-pointer ${
                          alphabetFilter === null 
                            ? 'bg-green-700' 
                            : 'border-green-700 text-green-300'
                        }`}
                        onClick={() => setAlphabetFilter(null)}
                      >
                        TOUS
                      </Badge>
                      {alphabet.map((letter) => (
                        <Badge
                          key={letter}
                          variant={alphabetFilter === letter ? "default" : "outline"}
                          className={`cursor-pointer uppercase ${
                            alphabetFilter === letter 
                              ? 'bg-green-700' 
                              : 'border-green-700 text-green-300'
                          }`}
                          onClick={() => setAlphabetFilter(letter)}
                        >
                          {letter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6">
        {/* Onglets */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-green-900/20 border border-green-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-green-700">
              Tous les termes
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-green-700">
              Favoris
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="data-[state=active]:bg-green-700">
              Signets
            </TabsTrigger>
          </TabsList>
          
          {/* Contenu des onglets */}
          <TabsContent value="all" className="space-y-6">
            {selectedTerm ? (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="ghost" onClick={() => setSelectedTerm(null)}>
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour au glossaire
                  </Button>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleFavorite(selectedTerm.id)}
                      className={`border-amber-500 ${selectedTerm.isFavorite ? 'bg-amber-900/50' : ''}`}
                    >
                      <Star className={`mr-2 h-4 w-4 ${selectedTerm.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                      {selectedTerm.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleBookmark(selectedTerm.id)}
                      className={`border-blue-500 ${selectedTerm.isBookmarked ? 'bg-blue-900/50' : ''}`}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {selectedTerm.isBookmarked ? 'Retirer des signets' : 'Ajouter aux signets'}
                    </Button>
                  </div>

                  {/* Boutons d'interaction IA */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => explainConceptDetail(selectedTerm.term, selectedTerm.definition)}
                      className="border-green-500 hover:bg-green-900/30"
                      disabled={isExplaining}
                    >
                      {isExplaining ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="mr-2 h-4 w-4 text-green-400" />
                          Explication détaillée
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generateQuizOnTerm(selectedTerm.term)}
                      className="border-purple-500 hover:bg-purple-900/30"
                      disabled={isGeneratingQuiz}
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Création du quiz...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                          Générer un quiz
                        </>
                      )}
                    </Button>
                    
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-500 hover:bg-blue-900/30"
                        disabled={isComparing}
                        onClick={() => {
                          if (selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0) {
                            const relatedTerm = selectedTerm.relatedTerms[0];
                            compareTermsDetail(selectedTerm.term, relatedTerm);
                          } else {
                            toast({
                              title: "Aucun terme lié",
                              description: "Ce terme n'a pas de termes connexes à comparer.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        {isComparing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Comparaison en cours...
                          </>
                        ) : (
                          <>
                            <Code className="mr-2 h-4 w-4 text-blue-400" />
                            Comparer avec un terme lié
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/30 to-teal-900/20 rounded-lg p-6 border border-green-800/70">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-green-800/70 rounded-md">
                      {selectedTerm.icon}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{selectedTerm.term}</h1>
                      {selectedTerm.acronym && (
                        <Badge className="bg-green-700 mt-1">
                          Acronyme: {selectedTerm.acronym}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-green-950/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-green-300">Définition</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2" 
                        onClick={() => copyDefinition(selectedTerm.id, selectedTerm.definition)}
                      >
                        {copiedTerm === selectedTerm.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="mt-2">{selectedTerm.definition}</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-green-300 mb-2">Définition complète</h2>
                      <div className="bg-slate-950/30 rounded-lg p-4 border border-green-900/50">
                        <p className="text-green-100">{selectedTerm.extendedDefinition}</p>
                      </div>
                    </div>
                    
                    {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-green-300 mb-2">Exemples</h2>
                        <div className="bg-slate-950/30 rounded-lg p-4 border border-green-900/50">
                          <ul className="space-y-2">
                            {selectedTerm.examples.map((example, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="min-w-4 pt-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1"></div>
                                </div>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-green-300 mb-2">Catégorie</h3>
                      <Badge className="bg-green-700">
                        {glossaryCategories.find(c => c.id === selectedTerm.category)?.name || selectedTerm.category}
                      </Badge>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-green-300 mb-2">Mots-clés</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="border-green-700/70 text-green-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedTerm.relatedTerms.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-green-300 mb-2">Termes associés</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.relatedTerms.map((termId) => {
                          const term = glossaryTerms.find(t => t.id === termId);
                          return term ? (
                            <Badge 
                              key={termId} 
                              className="bg-teal-800/70 cursor-pointer hover:bg-teal-700/80"
                              onClick={() => {
                                const relatedTerm = glossaryTerms.find(t => t.id === termId);
                                if (relatedTerm) setSelectedTerm(relatedTerm);
                              }}
                            >
                              {term.term}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {filteredTerms.length > 0 ? (
                  <div className="space-y-6">
                    <p className="text-blue-300">
                      {filteredTerms.length} termes trouvés
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTerms.map((term) => (
                        <Card 
                          key={term.id} 
                          className="bg-green-900/10 border-green-800/50 hover:bg-green-900/20 transition-all cursor-pointer overflow-hidden"
                          onClick={() => setSelectedTerm(term)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-800/70 rounded-md">
                                  {term.icon}
                                </div>
                                <div>
                                  <h3 className="font-bold">
                                    {term.term}
                                    {term.acronym && (
                                      <span className="ml-1 text-xs text-green-400">({term.acronym})</span>
                                    )}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs mt-1 border-green-700/50 text-green-300"
                                  >
                                    {glossaryCategories.find(c => c.id === term.category)?.name || term.category}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex">
                                {term.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                                {term.isBookmarked && <BookOpen className="h-4 w-4 text-blue-400 ml-1" />}
                              </div>
                            </div>
                            
                            <p className="text-sm mt-3 text-green-100 line-clamp-3">{term.definition}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-green-900/10 rounded-lg border border-green-900/50">
                    <Search className="h-10 w-10 mx-auto text-green-400 mb-3" />
                    <h3 className="text-xl font-semibold">Aucun terme trouvé</h3>
                    <p className="text-green-300 mt-1">Essayez de modifier vos critères de recherche</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="space-y-6">
            {glossaryTerms.filter(term => term.isFavorite).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {glossaryTerms.filter(term => term.isFavorite).map((term) => (
                  <Card 
                    key={term.id} 
                    className="bg-green-900/10 border-green-800/50 hover:bg-green-900/20 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                      setSelectedTerm(term);
                      setActiveTab('all');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-800/70 rounded-md">
                            {term.icon}
                          </div>
                          <div>
                            <h3 className="font-bold">
                              {term.term}
                              {term.acronym && (
                                <span className="ml-1 text-xs text-green-400">({term.acronym})</span>
                              )}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="text-xs mt-1 border-green-700/50 text-green-300"
                            >
                              {glossaryCategories.find(c => c.id === term.category)?.name || term.category}
                            </Badge>
                          </div>
                        </div>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                      
                      <p className="text-sm mt-3 text-green-100 line-clamp-3">{term.definition}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-green-900/10 rounded-lg border border-green-900/50">
                <Star className="h-10 w-10 mx-auto text-green-400 mb-3" />
                <h3 className="text-xl font-semibold">Aucun favori</h3>
                <p className="text-green-300 mt-1">Ajoutez des termes à vos favoris pour les retrouver facilement</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bookmarks" className="space-y-6">
            {glossaryTerms.filter(term => term.isBookmarked).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {glossaryTerms.filter(term => term.isBookmarked).map((term) => (
                  <Card 
                    key={term.id} 
                    className="bg-green-900/10 border-green-800/50 hover:bg-green-900/20 transition-all cursor-pointer overflow-hidden"
                    onClick={() => {
                      setSelectedTerm(term);
                      setActiveTab('all');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-800/70 rounded-md">
                            {term.icon}
                          </div>
                          <div>
                            <h3 className="font-bold">
                              {term.term}
                              {term.acronym && (
                                <span className="ml-1 text-xs text-green-400">({term.acronym})</span>
                              )}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="text-xs mt-1 border-green-700/50 text-green-300"
                            >
                              {glossaryCategories.find(c => c.id === term.category)?.name || term.category}
                            </Badge>
                          </div>
                        </div>
                        <BookOpen className="h-4 w-4 text-blue-400" />
                      </div>
                      
                      <p className="text-sm mt-3 text-green-100 line-clamp-3">{term.definition}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-green-900/10 rounded-lg border border-green-900/50">
                <BookOpen className="h-10 w-10 mx-auto text-green-400 mb-3" />
                <h3 className="text-xl font-semibold">Aucun signet</h3>
                <p className="text-green-300 mt-1">Marquez des termes en signet pour les consulter plus tard</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Section IA recommandations */}
        <Card className="mt-10 bg-blue-950/30 border-blue-800/70">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BrainCircuit className="mr-2 h-5 w-5 text-blue-400" />
              Assistant IA du glossaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-blue-200">
              Notre assistant IA peut vous aider à comprendre les termes de cybersécurité avec des exemples pratiques et des explications personnalisées.
            </p>
            
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <div className="flex items-start mb-3">
                <div className="bg-blue-700 rounded-full p-1.5 mr-2">
                  <BrainCircuit className="h-3 w-3" />
                </div>
                <div className="bg-blue-800/50 rounded-lg p-2 text-sm max-w-[80%]">
                  <p>Comment puis-je vous aider à comprendre les concepts de cybersécurité ?</p>
                </div>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (assistantQuestion.trim()) {
                  askAssistantQuestion(assistantQuestion);
                }
              }}>
                <div className="flex items-center">
                  <Input 
                    placeholder="Posez une question sur un terme ou un concept..." 
                    className="bg-blue-950/50 border-blue-700 text-white mt-2"
                    value={assistantQuestion}
                    onChange={(e) => setAssistantQuestion(e.target.value)}
                    disabled={isAskingQuestion}
                  />
                  <Button 
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="ml-1 mt-2"
                    disabled={isAskingQuestion || !assistantQuestion.trim()}
                  >
                    {isAskingQuestion ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    ) : (
                      <SendHorizontal className="h-4 w-4 text-blue-400" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-blue-300">
            Posez des questions comme "Quelle est la différence entre DDoS et DoS ?" ou "Expliquez-moi le Zero Trust en termes simples"
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}