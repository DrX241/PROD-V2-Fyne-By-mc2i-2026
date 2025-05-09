import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Bot, 
  RefreshCw, 
  Download, 
  Trash, 
  Edit, 
  Save,
  Plus,
  BookOpen,
  Copy,
  Check,
  Share,
  Star,
  Lock,
  Sparkles,
  X,
  Lightbulb,
  FileText,
  Laptop,
  Brain,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface MemoTemplate {
  id: string;
  title: string;
  description: string;
  type: 'checklist' | 'condensed' | 'comparison' | 'guide' | 'flashcards';
  category: string;
  icon: React.ReactNode;
  placeholderQuery: string;
  aiPrompt: string;
  example: string;
}

interface MemoItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  type: 'checklist' | 'condensed' | 'comparison' | 'guide' | 'flashcards';
  isStarred: boolean;
  tags: string[];
}

export default function MemoIAPersonnalise() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [memoTitle, setMemoTitle] = useState('');
  const [memoQuery, setMemoQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [isMemoSaved, setIsMemoSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMemos, setFilteredMemos] = useState<MemoItem[]>([]);
  const [selectedMemo, setSelectedMemo] = useState<MemoItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copiedMemoId, setCopiedMemoId] = useState<string | null>(null);
  const [displayOnlyStarred, setDisplayOnlyStarred] = useState(false);
  
  // Modèles de mémos
  const memoTemplates: MemoTemplate[] = [
    {
      id: 'checklist',
      title: 'Liste de contrôle',
      description: 'Une liste d\'étapes ou d\'éléments à vérifier',
      type: 'checklist',
      category: 'pratique',
      icon: <FileText />,
      placeholderQuery: 'Ex: Étapes pour répondre à un incident de sécurité',
      aiPrompt: 'Génère une liste de contrôle détaillée pour: ',
      example: '✓ Vérifier les accès au système\n✓ Examiner les journaux de sécurité\n✓ Isoler les systèmes compromis\n...'
    },
    {
      id: 'condensed',
      title: 'Résumé condensé',
      description: 'Version résumée et facile à comprendre d\'un concept complexe',
      type: 'condensed',
      category: 'éducatif',
      icon: <BookOpen />,
      placeholderQuery: 'Ex: Fonctionnement de la cryptographie asymétrique',
      aiPrompt: 'Crée un résumé condensé et clair de: ',
      example: 'La cryptographie asymétrique utilise deux clés distinctes...'
    },
    {
      id: 'comparison',
      title: 'Tableau comparatif',
      description: 'Comparaison côte à côte de deux concepts ou technologies',
      type: 'comparison',
      category: 'éducatif',
      icon: <Laptop />,
      placeholderQuery: 'Ex: Différences entre IDS et IPS',
      aiPrompt: 'Génère un tableau comparatif détaillé entre: ',
      example: '| IDS | IPS |\n| --- | --- |\n| Détection uniquement | Détection et prévention |\n...'
    },
    {
      id: 'guide',
      title: 'Guide pratique',
      description: 'Instructions étape par étape pour une tâche spécifique',
      type: 'guide',
      category: 'pratique',
      icon: <Lightbulb />,
      placeholderQuery: 'Ex: Comment configurer un VPN sécurisé',
      aiPrompt: 'Crée un guide pratique étape par étape pour: ',
      example: '1. Choisir un protocole VPN sécurisé\n2. Configurer l\'authentification\n...'
    },
    {
      id: 'flashcards',
      title: 'Cartes mémoire',
      description: 'Séries de questions/réponses pour mémoriser des concepts',
      type: 'flashcards',
      category: 'éducatif',
      icon: <Brain />,
      placeholderQuery: 'Ex: Concepts essentiels de la sécurité réseau',
      aiPrompt: 'Génère une série de cartes mémoire (Q/R) sur: ',
      example: 'Q: Qu\'est-ce qu\'un pare-feu ?\nR: Un système de sécurité qui surveille et filtre le trafic réseau...'
    }
  ];
  
  // Catégories de mémos
  const memoCategories = [
    { id: 'general', name: 'Général', color: 'blue' },
    { id: 'network', name: 'Sécurité réseau', color: 'purple' },
    { id: 'app', name: 'Sécurité des applications', color: 'green' },
    { id: 'crypto', name: 'Cryptographie', color: 'amber' },
    { id: 'governance', name: 'Gouvernance', color: 'red' },
    { id: 'incident', name: 'Réponse aux incidents', color: 'orange' }
  ];
  
  // Exemples de mémos prédéfinis
  const predefinedMemos: MemoItem[] = [
    {
      id: 'memo-1',
      title: 'Guide de réponse aux incidents',
      content: `# Guide de réponse aux incidents de cybersécurité

## Phase 1: Préparation
- Établir une politique de réponse aux incidents
- Former l'équipe de réponse
- Mettre en place des outils de détection
- Préparer des playbooks pour les scénarios courants

## Phase 2: Détection et analyse
- Collecter et analyser des preuves
- Déterminer si un incident s'est produit
- Évaluer l'impact et la gravité
- Documenter toutes les observations

## Phase 3: Confinement
- Isoler les systèmes affectés
- Préserver les preuves
- Identifier la source de l'attaque
- Bloquer les activités malveillantes

## Phase 4: Éradication
- Supprimer les malwares et les artefacts malveillants
- Corriger les vulnérabilités exploitées
- Renforcer la sécurité des systèmes

## Phase 5: Récupération
- Restaurer les systèmes à partir de sauvegardes propres
- Valider le fonctionnement des systèmes
- Surveiller pour détecter des activités suspectes

## Phase 6: Leçons apprises
- Documenter l'incident en détail
- Analyser la cause profonde
- Améliorer les processus de réponse
- Partager les connaissances avec l'équipe`,
      date: '2025-04-15T10:30:00',
      category: 'incident',
      type: 'guide',
      isStarred: true,
      tags: ['incident', 'réponse', 'guide', 'procédure']
    },
    {
      id: 'memo-2',
      title: 'Comparaison des algorithmes de chiffrement',
      content: `# Comparaison des algorithmes de chiffrement courants

| Algorithme | Type | Taille de clé | Sécurité | Cas d'usage |
|------------|------|---------------|----------|-------------|
| AES | Symétrique | 128, 192, 256 bits | Très élevée | Chiffrement de données au repos, VPN |
| RSA | Asymétrique | 2048+ bits | Élevée (vulnérable quantum) | Signature numérique, échange de clés |
| ECC | Asymétrique | 256 bits (équivalent RSA 3072) | Très élevée | Mobile, IoT, ressources limitées |
| ChaCha20 | Symétrique (stream) | 256 bits | Élevée | TLS, environnements mobiles |
| 3DES | Symétrique | 168 bits effectifs | Modérée (obsolète) | Compatibilité legacy seulement |
| Blowfish | Symétrique | 32-448 bits | Modérée | Remplacé par AES dans la plupart des cas |

## Forces et faiblesses

### AES (Advanced Encryption Standard)
- **Forces**: Standard mondial, très performant, résistant à la cryptanalyse
- **Faiblesses**: Implémentation vulnérable aux attaques par canal auxiliaire si mal protégée

### RSA
- **Forces**: Largement déployé, facile à comprendre
- **Faiblesses**: Gourmand en ressources, vulnérable aux ordinateurs quantiques

### ECC (Elliptic Curve Cryptography)
- **Forces**: Clés plus courtes pour sécurité équivalente, efficace
- **Faiblesses**: Moins mature que RSA, implémentation complexe

### ChaCha20-Poly1305
- **Forces**: Très performant sur hardware sans accélération AES, bonne sécurité
- **Faiblesses**: Support moins universel que AES`,
      date: '2025-04-12T14:45:00',
      category: 'crypto',
      type: 'comparison',
      isStarred: false,
      tags: ['cryptographie', 'chiffrement', 'algorithmes', 'comparaison']
    },
    {
      id: 'memo-3',
      title: 'Checklist d\'audit de sécurité web',
      content: `# Checklist d'audit de sécurité web

## Gestion des authentifications
- [ ] Vérifier la robustesse des politiques de mot de passe
- [ ] Tester la mise en œuvre de l'authentification multifacteur
- [ ] Valider le processus de récupération de compte
- [ ] Vérifier la protection contre le brute force
- [ ] Tester l'expiration et la rotation des sessions

## Protection contre les injections
- [ ] Tester les injections SQL sur tous les points d'entrée
- [ ] Vérifier la protection contre les attaques XSS
- [ ] Contrôler la validation des entrées utilisateurs
- [ ] Tester les protections CSRF sur les formulaires
- [ ] Vérifier les en-têtes de sécurité HTTP

## Gestion des accès
- [ ] Vérifier les contrôles d'accès horizontaux et verticaux
- [ ] Tester l'élévation de privilèges
- [ ] Valider la séparation des rôles et privilèges
- [ ] Contrôler les accès aux API et microservices
- [ ] Vérifier l'exposition de données sensibles dans les URLs

## Configuration et infrastructure
- [ ] Vérifier les certificats TLS (algorithmes, expiration)
- [ ] Analyser les en-têtes de sécurité (CSP, X-XSS-Protection, etc.)
- [ ] Contrôler la configuration des cookies (httpOnly, secure, SameSite)
- [ ] Vérifier les services exposés inutilement
- [ ] Valider les règles de pare-feu applicatif

## Gestion des données sensibles
- [ ] Vérifier le chiffrement des données au repos
- [ ] Contrôler la protection des données en transit
- [ ] Valider l'implémentation de masquage des données
- [ ] Vérifier la conformité RGPD
- [ ] Contrôler les politiques de rétention des données`,
      date: '2025-04-08T09:15:00',
      category: 'app',
      type: 'checklist',
      isStarred: true,
      tags: ['web', 'audit', 'checklist', 'sécurité']
    }
  ];
  
  // Initialisation des mémos
  useEffect(() => {
    // Charger les mémos depuis localStorage ou utiliser les exemples prédéfinis
    const storedMemos = localStorage.getItem('ai-memos');
    if (storedMemos) {
      setMemos(JSON.parse(storedMemos));
    } else {
      setMemos(predefinedMemos);
      localStorage.setItem('ai-memos', JSON.stringify(predefinedMemos));
    }
  }, []);
  
  // Filtrer les mémos lorsque les critères changent
  useEffect(() => {
    let filtered = memos;
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(memo => 
        memo.title.toLowerCase().includes(search) || 
        memo.content.toLowerCase().includes(search) ||
        memo.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Filtre par favoris
    if (displayOnlyStarred) {
      filtered = filtered.filter(memo => memo.isStarred);
    }
    
    // Tri par date (plus récent en premier)
    filtered = [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setFilteredMemos(filtered);
  }, [memos, searchTerm, displayOnlyStarred]);
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setSelectedTemplate(null);
    setMemoTitle('');
    setMemoQuery('');
    setSelectedCategory('general');
    setTags([]);
    setTagInput('');
    setGeneratedContent(null);
    setIsMemoSaved(false);
  };
  
  // Ajouter un tag
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };
  
  // Supprimer un tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  
  // Générer un mémo avec IA
  const generateMemo = () => {
    if (!selectedTemplate || !memoQuery) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un modèle et saisir votre requête",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Récupérer le template sélectionné
    const template = memoTemplates.find(t => t.id === selectedTemplate);
    
    // Simuler une génération par IA
    setTimeout(() => {
      let generatedText = '';
      
      if (template?.type === 'checklist') {
        generatedText = generateChecklistContent(memoQuery);
      } else if (template?.type === 'condensed') {
        generatedText = generateCondensedContent(memoQuery);
      } else if (template?.type === 'comparison') {
        generatedText = generateComparisonContent(memoQuery);
      } else if (template?.type === 'guide') {
        generatedText = generateGuideContent(memoQuery);
      } else if (template?.type === 'flashcards') {
        generatedText = generateFlashcardsContent(memoQuery);
      }
      
      setGeneratedContent(generatedText);
      setIsGenerating(false);
    }, 2000);
  };
  
  // Fonctions de génération de contenu (simulations)
  const generateChecklistContent = (query: string): string => {
    if (query.toLowerCase().includes('audit')) {
      return `# Checklist: ${query}

- [ ] Définir le périmètre et les objectifs de l'audit
- [ ] Constituer l'équipe d'audit et attribuer les rôles
- [ ] Inventorier les systèmes et applications concernés
- [ ] Collecter la documentation pertinente (architecture, politiques)
- [ ] Planifier les entretiens avec les parties prenantes clés
- [ ] Préparer les outils d'audit et de test
- [ ] Vérifier les configurations de sécurité
- [ ] Analyser les contrôles d'accès et la gestion des identités
- [ ] Évaluer la sécurité du réseau et des communications
- [ ] Examiner la gestion des vulnérabilités
- [ ] Tester les mécanismes de protection des données
- [ ] Vérifier les procédures de sauvegarde et de reprise
- [ ] Examiner la journalisation et la surveillance
- [ ] Évaluer la réponse aux incidents
- [ ] Vérifier la conformité aux normes applicables
- [ ] Compiler les résultats et les preuves
- [ ] Évaluer la gravité des problèmes identifiés
- [ ] Préparer le rapport d'audit
- [ ] Présenter les résultats aux parties prenantes
- [ ] Élaborer un plan de remédiation`;
    } else {
      return `# Checklist: ${query}

- [ ] Étape 1: Préparer l'environnement de travail
- [ ] Étape 2: Collecter les informations nécessaires
- [ ] Étape 3: Analyser les risques potentiels
- [ ] Étape 4: Définir les priorités d'action
- [ ] Étape 5: Mettre en œuvre les premières mesures
- [ ] Étape 6: Vérifier les configurations de base
- [ ] Étape 7: Tester les mécanismes de protection
- [ ] Étape 8: Documenter les processus établis
- [ ] Étape 9: Former les équipes concernées
- [ ] Étape 10: Établir un calendrier de suivi
- [ ] Étape 11: Mettre en place des indicateurs de performance
- [ ] Étape 12: Prévoir les scénarios de crise
- [ ] Étape 13: Tester les procédures d'urgence
- [ ] Étape 14: Réviser régulièrement les mesures
- [ ] Étape 15: Améliorer continuellement le processus`;
    }
  };
  
  const generateCondensedContent = (query: string): string => {
    if (query.toLowerCase().includes('cryptographie')) {
      return `# Résumé condensé: ${query}

## Principes fondamentaux

La cryptographie est la science qui permet de sécuriser les communications en présence d'adversaires. Elle repose sur quatre piliers essentiels:

1. **Confidentialité**: Seuls les destinataires autorisés peuvent comprendre le message
2. **Intégrité**: Garantie que le message n'a pas été altéré
3. **Authentification**: Confirmation de l'identité de l'expéditeur
4. **Non-répudiation**: L'expéditeur ne peut nier avoir envoyé le message

## Types de cryptographie

### Cryptographie symétrique
- Utilise la même clé pour chiffrer et déchiffrer
- Rapide et efficace pour de grands volumes de données
- Exemples: AES, DES, ChaCha20
- Défi principal: l'échange sécurisé de clés

### Cryptographie asymétrique
- Utilise une paire de clés: publique (pour chiffrer) et privée (pour déchiffrer)
- Plus lente mais résout le problème d'échange de clés
- Exemples: RSA, ECC, ElGamal
- Applications: signatures numériques, échange de clés

### Fonctions de hachage
- Transforment des données de taille variable en empreinte de taille fixe
- Propriétés: résistance aux collisions, effet avalanche
- Exemples: SHA-256, SHA-3, BLAKE2
- Applications: vérification d'intégrité, stockage de mots de passe

## Applications modernes

- Protocoles TLS/SSL pour sécuriser le web
- Chiffrement de bout en bout dans les messageries
- Blockchain et cryptomonnaies
- VPN et tunnels sécurisés
- Authentification et signatures numériques`;
    } else {
      return `# Résumé condensé: ${query}

## Concept clé

${query} est un domaine essentiel de la cybersécurité qui se concentre sur la protection des systèmes d'information contre les accès non autorisés et les dommages potentiels.

## Principes fondamentaux

1. **Premier principe**: L'approche proactive est toujours préférable à la réaction
2. **Deuxième principe**: La défense en profondeur offre plusieurs couches de protection
3. **Troisième principe**: Le principe du moindre privilège limite l'exposition aux risques
4. **Quatrième principe**: La surveillance continue permet de détecter les anomalies

## Applications pratiques

- Application dans les infrastructures critiques
- Intégration dans les processus d'entreprise
- Mise en œuvre dans les technologies émergentes
- Adaptation aux nouveaux modèles de menaces

## Tendances futures

- Évolution vers des approches plus adaptatives
- Intégration des technologies d'intelligence artificielle
- Automatisation croissante des processus
- Collaboration renforcée entre les acteurs`;
    }
  };
  
  const generateComparisonContent = (query: string): string => {
    if (query.toLowerCase().includes('ids') && query.toLowerCase().includes('ips')) {
      return `# Comparaison: IDS vs IPS

| Critère | IDS (Système de détection d'intrusion) | IPS (Système de prévention d'intrusion) |
|---------|----------------------------------------|----------------------------------------|
| **Fonction principale** | Détecte et alerte sur les activités suspectes | Détecte, alerte ET bloque les activités suspectes |
| **Mode d'opération** | Passif (monitoring uniquement) | Actif (intervention sur le trafic) |
| **Emplacement réseau** | En copie du trafic (port SPAN/TAP) | En ligne sur le chemin du trafic |
| **Impact sur le trafic** | Aucun impact sur le flux de données | Peut bloquer ou modifier le trafic malveillant |
| **Latence introduite** | Minimale à nulle | Potentiellement plus élevée (inspection en temps réel) |
| **Risque de faux positifs** | Génère des alertes, pas d'impact direct | Peut bloquer du trafic légitime par erreur |
| **Méthodes de détection** | - Signatures<br>- Anomalies<br>- Analyse comportementale | - Signatures<br>- Anomalies<br>- Analyse comportementale |
| **Exemples de solutions** | - Snort (mode NIDS)<br>- Suricata (mode détection)<br>- Zeek (Bro) | - Snort (mode inline)<br>- Suricata (mode inline)<br>- Solutions commerciales NextGen |
| **Avantages** | - Pas de point unique de défaillance<br>- Aucun risque de bloquer du trafic légitime<br>- Détection approfondie | - Protection proactive<br>- Réponse automatisée<br>- Blocage en temps réel |
| **Inconvénients** | - Réponse manuelle nécessaire<br>- Délai entre détection et action | - Point unique de défaillance<br>- Risque de bloquer du trafic légitime<br>- Configuration plus complexe |

## Cas d'utilisation typiques

### IDS
- Environnements où la disponibilité est critique
- Analyse forensique et détection de menaces avancées
- Supervision de réseaux sensibles où le blocage automatique présente un risque

### IPS
- Protection proactive contre les attaques connues
- Environnements nécessitant une réponse immédiate
- Mise en œuvre de politiques de sécurité strictes`;
    } else {
      return `# Comparaison: ${query}

| Critère | Option A | Option B |
|---------|----------|----------|
| **Fonctionnalité principale** | Surveillance et détection | Prévention et blocage |
| **Architecture** | Distribué et modulaire | Centralisé et intégré |
| **Déploiement** | Simple, peu intrusif | Complexe, nécessite planification |
| **Performance** | Impact minimal sur les systèmes | Peut introduire de la latence |
| **Maintenance** | Mises à jour fréquentes nécessaires | Maintenance planifiée périodique |
| **Coût** | Investissement initial modéré | Coût total plus élevé |
| **Intégration** | S'intègre avec la plupart des systèmes | Nécessite des adaptateurs spécifiques |
| **Évolutivité** | Hautement évolutif | Limitations à grande échelle |

## Cas d'utilisation optimaux

### Option A
- Environnements nécessitant une surveillance discrète
- Infrastructures distribuées ou hétérogènes
- Priorité à la détection avancée

### Option B
- Systèmes critiques nécessitant une protection robuste
- Environnements avec politique de sécurité stricte
- Besoin d'automatisation des réponses`;
    }
  };
  
  const generateGuideContent = (query: string): string => {
    if (query.toLowerCase().includes('vpn')) {
      return `# Guide étape par étape: ${query}

## Préparation

### Étape 1: Choisir un protocole VPN
Le choix du protocole détermine le niveau de sécurité et de performance.
- **OpenVPN**: Open source, très sécurisé, adapté à la plupart des cas d'usage
- **WireGuard**: Moderne, performant, code minimal
- **IPsec/IKEv2**: Bonne compatibilité avec les appareils mobiles, natif sur plusieurs plateformes
- **À éviter**: PPTP (vulnérable), L2TP sans IPsec (insuffisant)

### Étape 2: Planifier l'architecture
- Déterminer l'emplacement du serveur VPN (cloud ou sur site)
- Définir les réseaux et sous-réseaux à connecter
- Planifier la stratégie d'adressage IP
- Évaluer les besoins en bande passante

## Installation du serveur

### Étape 3: Préparer le serveur
\`\`\`bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances
sudo apt install -y ufw curl wget
\`\`\`

### Étape 4: Installer le logiciel VPN
Pour OpenVPN:
\`\`\`bash
wget https://git.io/vpn -O openvpn-install.sh
chmod +x openvpn-install.sh
sudo ./openvpn-install.sh
\`\`\`

### Étape 5: Configurer le pare-feu
\`\`\`bash
# Pour OpenVPN (port UDP 1194 par défaut)
sudo ufw allow 1194/udp
sudo ufw enable
\`\`\`

## Configuration de la sécurité

### Étape 6: Renforcer l'authentification
- Utiliser des certificats avec une longueur minimale de 2048 bits
- Envisager une authentification à deux facteurs
- Mettre en place une rotation régulière des certificats

### Étape 7: Sécuriser la configuration
\`\`\`
# Dans le fichier de configuration du serveur
cipher AES-256-GCM     # Chiffrement fort
auth SHA256            # Algorithme de hachage robuste
tls-version-min 1.2    # Version TLS minimale
\`\`\`

### Étape 8: Configurer le DNS
- Utiliser des serveurs DNS sécurisés (ex: 1.1.1.2, 9.9.9.9)
- Activer le DNS over TLS si possible
- Éviter les fuites DNS

## Distribution des configurations clients

### Étape 9: Générer les configurations client
\`\`\`bash
# Pour OpenVPN
sudo ./openvpn-install.sh  # Sélectionner l'option pour ajouter un client
\`\`\`

### Étape 10: Distribuer les configurations de manière sécurisée
- Utiliser un canal chiffré pour le transfert (HTTPS, SFTP)
- Ne jamais envoyer les configurations par email non chiffré
- Considérer un portail sécurisé pour la distribution des configurations

## Vérification et maintenance

### Étape 11: Tester la connexion
- Vérifier l'établissement de la connexion
- Tester la protection contre les fuites d'IP
- Valider les performances avec différents types de trafic

### Étape 12: Mettre en place un monitoring
- Configurer la journalisation des connexions
- Mettre en place des alertes pour les événements suspects
- Planifier des audits réguliers de sécurité

### Étape 13: Planifier la maintenance
- Mettre à jour régulièrement le logiciel VPN
- Renouveler les certificats avant expiration
- Réviser périodiquement les règles de pare-feu et les politiques de routage`;
    } else {
      return `# Guide étape par étape: ${query}

## Phase de préparation

### Étape 1: Évaluation des besoins
- Identifier les objectifs précis
- Évaluer les ressources disponibles
- Déterminer les contraintes techniques
- Établir un calendrier réaliste

### Étape 2: Rassembler les prérequis
- Obtenir les accès nécessaires
- Préparer l'environnement de travail
- Collecter la documentation technique
- S'assurer des compétences requises

## Mise en œuvre

### Étape 3: Configuration initiale
\`\`\`
# Exemple de configuration de base
setting1=valeur1
setting2=valeur2
enable_feature=true
\`\`\`

### Étape 4: Installation des composants
- Installer le composant principal
- Configurer les dépendances
- Vérifier les versions et compatibilités
- Tester la communication entre les éléments

### Étape 5: Paramétrage avancé
- Ajuster les paramètres de sécurité
- Optimiser les performances
- Configurer les sauvegardes
- Mettre en place la journalisation

## Vérification et finalisation

### Étape 6: Tests de validation
- Vérifier la fonctionnalité principale
- Tester les cas d'erreur
- Valider les performances
- S'assurer de la sécurité

### Étape 7: Documentation et formation
- Documenter la configuration
- Créer des procédures de maintenance
- Préparer des guides utilisateurs
- Former les équipes concernées

### Étape 8: Surveillance et maintenance
- Mettre en place des alertes
- Planifier les mises à jour
- Établir une procédure de sauvegarde
- Prévoir des revues périodiques`;
    }
  };
  
  const generateFlashcardsContent = (query: string): string => {
    if (query.toLowerCase().includes('réseau')) {
      return `# Cartes mémoire: ${query}

## Carte 1
**Q**: Qu'est-ce qu'un pare-feu (firewall) et quel est son rôle principal?  
**R**: Un pare-feu est un système de sécurité qui surveille et filtre le trafic réseau entrant et sortant selon des règles prédéfinies. Son rôle principal est de créer une barrière entre un réseau interne sécurisé et les réseaux externes non fiables (comme Internet).

## Carte 2
**Q**: Quelle est la différence entre un pare-feu de nouvelle génération (NGFW) et un pare-feu traditionnel?  
**R**: Un NGFW intègre des fonctionnalités avancées comme l'inspection approfondie des paquets, la prévention d'intrusion, l'identification des applications, et parfois des fonctions antivirus, alors qu'un pare-feu traditionnel se limite généralement au filtrage basé sur les ports, protocoles et adresses IP.

## Carte 3
**Q**: Qu'est-ce qu'un VLAN et pourquoi est-il utilisé?  
**R**: Un VLAN (Virtual Local Area Network) est un réseau local virtuel qui permet de segmenter logiquement un réseau physique. Il est utilisé pour isoler le trafic, améliorer les performances, simplifier la gestion et renforcer la sécurité en séparant différents types de trafic ou départements.

## Carte 4
**Q**: Expliquez le principe du modèle OSI et nommez ses sept couches.  
**R**: Le modèle OSI (Open Systems Interconnection) est un cadre conceptuel qui standardise les fonctions de communication en sept couches: 1-Physique, 2-Liaison de données, 3-Réseau, 4-Transport, 5-Session, 6-Présentation, 7-Application.

## Carte 5
**Q**: Qu'est-ce que le NAT et à quoi sert-il?  
**R**: NAT (Network Address Translation) est un processus permettant de modifier les adresses IP dans l'en-tête des paquets. Il sert principalement à permettre à plusieurs appareils d'un réseau privé de partager une seule adresse IP publique, économisant ainsi des adresses IPv4 et ajoutant une couche de sécurité.

## Carte 6
**Q**: Quelle est la différence entre un switch et un routeur?  
**R**: Un switch opère au niveau de la couche 2 (liaison de données) et transfère les trames en fonction des adresses MAC au sein d'un même réseau local. Un routeur opère au niveau de la couche 3 (réseau) et route les paquets entre différents réseaux en fonction des adresses IP.

## Carte 7
**Q**: Qu'est-ce que le protocole ARP et quel problème résout-il?  
**R**: ARP (Address Resolution Protocol) est un protocole qui traduit les adresses IP (couche 3) en adresses MAC (couche 2). Il résout le problème de correspondance entre les adresses logiques (IP) et les adresses physiques (MAC) nécessaires pour la communication sur un réseau local.

## Carte 8
**Q**: Qu'est-ce qu'une attaque Man-in-the-Middle (MitM) dans le contexte réseau?  
**R**: Une attaque MitM se produit lorsqu'un attaquant s'intercale secrètement entre deux parties communicantes, relayant et potentiellement altérant les messages. Sur un réseau, cela peut être réalisé par ARP poisoning, DNS spoofing, ou en compromettant un point d'accès Wi-Fi.

## Carte 9
**Q**: Qu'est-ce que le DMZ (zone démilitarisée) en sécurité réseau?  
**R**: Une DMZ est un sous-réseau physique ou logique qui expose les services externes d'une organisation à un réseau non fiable (généralement Internet). Elle agit comme une zone tampon entre le réseau interne sécurisé et Internet, permettant d'accéder à certains services tout en protégeant le réseau interne.

## Carte 10
**Q**: Expliquez le concept de défense en profondeur dans la sécurité réseau.  
**R**: La défense en profondeur consiste à mettre en place plusieurs couches de sécurité complémentaires, de sorte que si une mesure échoue, d'autres sont présentes pour maintenir la protection. Cela inclut des contrôles physiques, techniques et administratifs à différents niveaux du réseau.`;
    } else {
      return `# Cartes mémoire: ${query}

## Carte 1
**Q**: Quelle est la définition principale du concept?  
**R**: Le concept fait référence à une approche structurée qui permet de sécuriser les systèmes d'information en implémentant des contrôles techniques et organisationnels adaptés aux risques identifiés.

## Carte 2
**Q**: Quels sont les trois principes fondamentaux à retenir?  
**R**: Les trois principes fondamentaux sont: 1) La défense en profondeur, 2) Le principe du moindre privilège, et 3) La surveillance continue et l'amélioration.

## Carte 3
**Q**: Comment s'applique ce concept dans un environnement d'entreprise?  
**R**: Dans un environnement d'entreprise, ce concept s'applique à travers des politiques formelles, des procédures documentées, une gouvernance claire, des responsabilités définies et des contrôles adaptés à la taille de l'organisation.

## Carte 4
**Q**: Quels sont les principaux défis de mise en œuvre?  
**R**: Les principaux défis incluent l'équilibre entre sécurité et utilisabilité, les contraintes budgétaires, le manque d'expertise technique, et l'évolution constante des menaces.

## Carte 5
**Q**: Comment mesurer l'efficacité de l'implémentation?  
**R**: L'efficacité peut être mesurée par des audits réguliers, des tests de pénétration, des indicateurs de performance (KPI) spécifiques, et en comparant les incidents de sécurité avant et après implémentation.

## Carte 6
**Q**: Quelles sont les tendances récentes dans ce domaine?  
**R**: Les tendances récentes comprennent l'automatisation des contrôles, l'intégration de l'intelligence artificielle, l'approche Zero Trust, et l'adaptation aux environnements cloud et mobiles.

## Carte 7
**Q**: Citez trois bonnes pratiques essentielles.  
**R**: Trois bonnes pratiques essentielles sont: 1) La formation régulière des utilisateurs, 2) La gestion rigoureuse des vulnérabilités, et 3) La mise en place de processus de réponse aux incidents.

## Carte 8
**Q**: Comment ce concept s'intègre-t-il avec d'autres domaines?  
**R**: Ce concept s'intègre avec la gestion des risques, la conformité réglementaire, la continuité d'activité, et les stratégies de transformation numérique de l'organisation.`;
    }
  };
  
  // Sauvegarder un mémo
  const saveMemo = () => {
    if (!memoTitle || !generatedContent || !selectedTemplate) {
      toast({
        title: "Information manquante",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    const template = memoTemplates.find(t => t.id === selectedTemplate);
    
    const newMemo: MemoItem = {
      id: `memo-${Date.now()}`,
      title: memoTitle,
      content: generatedContent,
      date: new Date().toISOString(),
      category: selectedCategory,
      type: template?.type || 'condensed',
      isStarred: false,
      tags: tags
    };
    
    const updatedMemos = [newMemo, ...memos];
    setMemos(updatedMemos);
    localStorage.setItem('ai-memos', JSON.stringify(updatedMemos));
    
    setIsMemoSaved(true);
    
    toast({
      title: "Mémo créé avec succès",
      description: "Vous pouvez le retrouver dans l'onglet Bibliothèque",
      variant: "default"
    });
  };
  
  // Supprimer un mémo
  const deleteMemo = (id: string) => {
    const updatedMemos = memos.filter(memo => memo.id !== id);
    setMemos(updatedMemos);
    localStorage.setItem('ai-memos', JSON.stringify(updatedMemos));
    
    // Si le mémo actuellement sélectionné est supprimé
    if (selectedMemo && selectedMemo.id === id) {
      setSelectedMemo(null);
    }
    
    toast({
      title: "Mémo supprimé",
      variant: "default"
    });
  };
  
  // Marquer un mémo comme favori
  const toggleStarMemo = (id: string) => {
    const updatedMemos = memos.map(memo => 
      memo.id === id ? {...memo, isStarred: !memo.isStarred} : memo
    );
    
    setMemos(updatedMemos);
    localStorage.setItem('ai-memos', JSON.stringify(updatedMemos));
    
    // Si le mémo actuellement sélectionné est modifié
    if (selectedMemo && selectedMemo.id === id) {
      setSelectedMemo({...selectedMemo, isStarred: !selectedMemo.isStarred});
    }
    
    toast({
      title: updatedMemos.find(m => m.id === id)?.isStarred 
        ? "Mémo ajouté aux favoris" 
        : "Mémo retiré des favoris",
      variant: "default"
    });
  };
  
  // Enregistrer les modifications d'un mémo
  const saveEditedMemo = () => {
    if (!selectedMemo) return;
    
    const updatedMemos = memos.map(memo => 
      memo.id === selectedMemo.id ? {...memo, content: editContent} : memo
    );
    
    setMemos(updatedMemos);
    localStorage.setItem('ai-memos', JSON.stringify(updatedMemos));
    
    setSelectedMemo({...selectedMemo, content: editContent});
    setIsEditing(false);
    
    toast({
      title: "Modifications enregistrées",
      variant: "default"
    });
  };
  
  // Copier le contenu d'un mémo
  const copyMemoContent = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMemoId(id);
    
    setTimeout(() => {
      setCopiedMemoId(null);
    }, 2000);
    
    toast({
      title: "Contenu copié",
      description: "Le contenu du mémo a été copié dans le presse-papiers",
      variant: "default"
    });
  };
  
  // Télécharger un mémo en format Markdown
  const downloadMemo = (memo: MemoItem) => {
    const blob = new Blob([memo.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${memo.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Mémo téléchargé",
      description: "Le mémo a été téléchargé au format Markdown",
      variant: "default"
    });
  };

  // Formater le contenu Markdown (simulation basique)
  const formatMarkdown = (content: string) => {
    // Cette fonction est une simulation simplifiée - dans une vraie application, utilisez une bibliothèque comme react-markdown
    return content
      .replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold my-3">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold my-2 text-blue-300">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 class="text-md font-medium my-1 text-blue-200">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`{3}([\s\S]*?)`{3}/gm, '<pre class="bg-slate-900 p-2 rounded-md my-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded">$1</code>')
      .replace(/\n- \[([ x])\] (.*?)$/gm, (match, checked, text) => 
        `<div class="flex items-start gap-2 my-1">
          <div class="w-5 h-5 border rounded flex-shrink-0 ${checked === 'x' ? 'bg-blue-900 border-blue-700' : 'border-blue-800'} flex items-center justify-center">
            ${checked === 'x' ? '<span class="text-blue-300">✓</span>' : ''}
          </div>
          <span>${text}</span>
        </div>`
      )
      .replace(/\n- (.*?)$/gm, '<div class="flex items-center gap-2 my-1"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div><span>$1</span></div>')
      .replace(/\n\d+\. (.*?)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-blue-400">•</span><span>$1</span></div>')
      .replace(/\n\n/g, '<p class="my-2"></p>')
      .replace(/\*\*Q\*\*: (.*?)  \n\*\*R\*\*: (.*?)$/gm, 
        '<div class="bg-blue-900/30 rounded-md p-3 my-3 border-l-4 border-blue-600">' +
        '<div class="font-semibold text-blue-200">Q: $1</div>' +
        '<div class="mt-2">R: $2</div>' +
        '</div>'
      )
      .replace(/\| (.*?) \|/g, '<td class="border border-blue-800 px-3 py-2">$1</td>')
      .replace(/<td(.*?)<\/td>\n/g, '<tr>$&</tr>')
      .replace(/<tr><td(.*?)<\/td><\/tr>/g, '<table class="w-full my-3 border-collapse"><thead>$&</thead><tbody>')
      .replace(/<\/tbody>(?![\s\S]*<\/tbody>)/g, '</tbody></table>');
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
              <BrainCircuit className="mr-3 h-6 w-6 text-purple-400" />
              Mémo IA personnalisé
            </h1>
            <p className="text-blue-200 mt-1">Créez des aide-mémoires sur mesure grâce à l'intelligence artificielle</p>
          </div>
        </div>
        
        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-purple-900/20 border border-purple-800">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-700">
              Créer un mémo
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-purple-700">
              Bibliothèque
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Création */}
          <TabsContent value="create" className="space-y-6">
            {isMemoSaved ? (
              <Card className="bg-purple-900/20 border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-400" />
                    Mémo créé avec succès
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Votre mémo a été ajouté à votre bibliothèque personnelle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-900/50 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mt-4">{memoTitle}</h3>
                    <p className="text-blue-200 mt-1">
                      Catégorie: {memoCategories.find(c => c.id === selectedCategory)?.name}
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-purple-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="border-purple-700"
                    onClick={() => {
                      setActiveTab('library');
                      const lastCreatedMemo = memos[0];
                      if (lastCreatedMemo) {
                        setSelectedMemo(lastCreatedMemo);
                      }
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Voir le mémo
                  </Button>
                  <Button
                    className="bg-purple-700 hover:bg-purple-800"
                    onClick={resetForm}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un nouveau mémo
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="bg-purple-900/20 border-purple-800">
                  <CardHeader>
                    <CardTitle>Choisir un modèle</CardTitle>
                    <CardDescription className="text-blue-200">
                      Sélectionnez le type de mémo que vous souhaitez créer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {memoTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedTemplate === template.id 
                              ? 'bg-purple-900/50 border-purple-500' 
                              : 'bg-slate-900/30 border-slate-800 hover:border-purple-700'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-md bg-purple-800/70">
                              {template.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{template.title}</h4>
                              <p className="text-xs text-blue-200">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {selectedTemplate && (
                  <Card className="bg-purple-900/20 border-purple-800">
                    <CardHeader>
                      <CardTitle>Détails du mémo</CardTitle>
                      <CardDescription className="text-blue-200">
                        Personnalisez votre mémo {memoTemplates.find(t => t.id === selectedTemplate)?.title.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Titre du mémo</label>
                        <Input 
                          placeholder="Donnez un titre à votre mémo"
                          value={memoTitle}
                          onChange={(e) => setMemoTitle(e.target.value)}
                          className="bg-purple-950/40 border-purple-800"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Votre requête</label>
                        <Textarea 
                          placeholder={memoTemplates.find(t => t.id === selectedTemplate)?.placeholderQuery}
                          value={memoQuery}
                          onChange={(e) => setMemoQuery(e.target.value)}
                          className="bg-purple-950/40 border-purple-800 min-h-[100px]"
                        />
                        <p className="text-xs text-blue-300 mt-1">
                          Soyez précis pour obtenir un résultat personnalisé à vos besoins
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Catégorie</label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="bg-purple-950/40 border-purple-800">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent className="bg-purple-900 border-purple-800">
                            {memoCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tags (facultatif)</label>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Ajouter un tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            className="bg-purple-950/40 border-purple-800"
                          />
                          <Button 
                            variant="outline" 
                            className="border-purple-700"
                            onClick={addTag}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="border-purple-700 pl-2 pr-1 py-1"
                            >
                              {tag}
                              <button 
                                className="ml-1 text-purple-400 hover:text-purple-300"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="bg-purple-700 hover:bg-purple-800 w-full"
                        onClick={generateMemo}
                        disabled={isGenerating || !memoQuery}
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Générer le mémo avec l'IA
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                
                {generatedContent && (
                  <Card className="bg-purple-900/20 border-purple-800">
                    <CardHeader>
                      <CardTitle>Prévisualisation du mémo</CardTitle>
                      <CardDescription className="text-blue-200">
                        Vérifiez le contenu généré avant de l'enregistrer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-950/40 border border-blue-900 rounded-lg p-4 max-h-[500px] overflow-y-auto markdown-preview">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: formatMarkdown(generatedContent)
                          }} 
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        className="border-purple-700"
                        onClick={() => setGeneratedContent(null)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Régénérer
                      </Button>
                      <Button 
                        className="bg-purple-700 hover:bg-purple-800"
                        onClick={saveMemo}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer le mémo
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Onglet Bibliothèque */}
          <TabsContent value="library" className="space-y-6">
            {selectedMemo ? (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="ghost" onClick={() => setSelectedMemo(null)}>
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour à la bibliothèque
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleStarMemo(selectedMemo.id)}
                      className={`border-amber-500 ${selectedMemo.isStarred ? 'bg-amber-900/50' : ''}`}
                    >
                      <Star className={`mr-2 h-4 w-4 ${selectedMemo.isStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                      {selectedMemo.isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadMemo(selectedMemo)}
                      className="border-purple-500"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                
                <Card className="bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border-purple-800/70">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{selectedMemo.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`bg-${memoCategories.find(c => c.id === selectedMemo.category)?.color}-700`}>
                            {memoCategories.find(c => c.id === selectedMemo.category)?.name}
                          </Badge>
                          <Badge variant="outline" className="border-purple-700">
                            {memoTemplates.find(t => t.type === selectedMemo.type)?.title}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyMemoContent(selectedMemo.id, selectedMemo.content)}
                        >
                          {copiedMemoId === selectedMemo.id ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditContent(selectedMemo.content);
                            setIsEditing(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => deleteMemo(selectedMemo.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {selectedMemo.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="border-purple-700/70 text-blue-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-blue-300 mt-3">
                      Créé le {new Date(selectedMemo.date).toLocaleDateString()} à {new Date(selectedMemo.date).toLocaleTimeString()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <Textarea 
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[400px] bg-blue-950/40 border-blue-800 font-mono"
                        />
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            className="border-purple-700"
                            onClick={() => setIsEditing(false)}
                          >
                            Annuler
                          </Button>
                          <Button 
                            className="bg-purple-700 hover:bg-purple-800"
                            onClick={saveEditedMemo}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-950/40 border border-blue-900 rounded-lg p-4 markdown-preview">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: formatMarkdown(selectedMemo.content)
                          }} 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                    <Input 
                      placeholder="Rechercher dans vos mémos..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-purple-950/40 border-purple-800 text-white placeholder:text-purple-300/70"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-amber-600 ${displayOnlyStarred ? 'bg-amber-900/30' : ''}`}
                      onClick={() => setDisplayOnlyStarred(!displayOnlyStarred)}
                    >
                      <Star className={`mr-2 h-4 w-4 ${displayOnlyStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                      {displayOnlyStarred ? 'Tous les mémos' : 'Favoris uniquement'}
                    </Button>
                    
                    <Button
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800"
                      onClick={() => {
                        resetForm();
                        setActiveTab('create');
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau mémo
                    </Button>
                  </div>
                </div>
                
                {filteredMemos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMemos.map((memo) => (
                      <Card 
                        key={memo.id} 
                        className="bg-purple-900/10 border-purple-800/50 hover:bg-purple-900/20 transition-all cursor-pointer overflow-hidden"
                        onClick={() => setSelectedMemo(memo)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{memo.title}</h3>
                              <div className="flex gap-2 mt-1">
                                <Badge className={`bg-${memoCategories.find(c => c.id === memo.category)?.color}-700 text-xs py-0`}>
                                  {memoCategories.find(c => c.id === memo.category)?.name}
                                </Badge>
                                <Badge variant="outline" className="border-purple-700/70 text-xs py-0">
                                  {memoTemplates.find(t => t.type === memo.type)?.title}
                                </Badge>
                              </div>
                            </div>
                            {memo.isStarred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                          </div>
                          
                          <div className="mt-3 text-sm text-blue-200 line-clamp-3">
                            {memo.content.replace(/[#*`]/g, '').substring(0, 100)}...
                          </div>
                          
                          <div className="flex gap-1 flex-wrap mt-3">
                            {memo.tags.slice(0, 3).map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="border-purple-700/50 text-purple-200 text-xs py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {memo.tags.length > 3 && (
                              <Badge variant="outline" className="border-purple-700/50 text-purple-200 text-xs py-0">
                                +{memo.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-blue-300 mt-3">
                            {new Date(memo.date).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-purple-900/10 rounded-lg border border-purple-900/50">
                    <BookOpen className="h-10 w-10 mx-auto text-purple-400 mb-3" />
                    <h3 className="text-xl font-semibold">Aucun mémo trouvé</h3>
                    <p className="text-purple-300 mt-1">
                      {searchTerm 
                        ? "Aucun résultat pour votre recherche" 
                        : displayOnlyStarred 
                          ? "Vous n'avez pas encore de mémos favoris" 
                          : "Créez votre premier mémo IA personnalisé"}
                    </p>
                    {!searchTerm && !displayOnlyStarred && (
                      <Button 
                        className="mt-4 bg-purple-700 hover:bg-purple-800"
                        onClick={() => {
                          resetForm();
                          setActiveTab('create');
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Créer un mémo
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}